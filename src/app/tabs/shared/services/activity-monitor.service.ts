import { Injectable, Optional, NgZone } from '@angular/core';
import {
  Observable,
  Subject,
  Subscription,
  merge,
  fromEvent,
  from,
  interval,
  timer,
  of
} from 'rxjs';
import {
  bufferTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  scan,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';

/**
 * User's idle service.
 */
@Injectable()
export class ActivityMonitorService {
  ping$: Observable<any>;

  /**
   * Events that can interrupts user's inactivity timer.
   */
  protected activityEvents$: Observable<any>;

  protected timerStart$ = new Subject<boolean>();
  protected timeout$ = new Subject<boolean>();
  protected idle$: Observable<any>;
  protected timer$: Observable<any>;
  /**
   * Idle value in seconds.
   * Default equals to 10 minutes.
   */
  protected idle = 0;
  /**
   * Timeout value in seconds.
   * Default equals to 5 minutes.
   */
  protected timeout = 0;
  /**
   * Ping value in seconds.
   * * Default equals to 2 minutes.
   */
  protected ping = 120;
  /**
   * Timeout status.
   */
  protected isTimeout: boolean;
  /**
   * Timer of user's inactivity is in progress.
   */
  protected isInactivityTimer: boolean;
  protected isIdleDetected: boolean;

  protected idleSubscription: Subscription;

  constructor(private _ngZone: NgZone,
    private envService: EnvService) {
    this.idle = envService.idle;
    this.timeout = envService.timeout;
    this.activityEvents$ = merge(
      fromEvent(window, 'click'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'scroll')
    );

    this.idle$ = from(this.activityEvents$);
  }

  /**
   * Start watching for user idle and setup timer and ping.
   */
  startWatching() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    // If any of user events is not active for idle-seconds when start timer.
    this.idleSubscription = this.idle$
      .pipe(
        bufferTime(500), // Starting point of detecting of user's inactivity
        filter(
          arr => !arr.length && !this.isIdleDetected && !this.isInactivityTimer
        ),
        tap(() => (this.isIdleDetected = true)),
        switchMap(() =>
          this._ngZone.runOutsideAngular(() =>
            interval(1000).pipe(
              takeUntil(
                merge(
                  this.activityEvents$,
                  timer(this.idle * 1000).pipe(
                    tap(() => {
                      this.isInactivityTimer = true;
                      this.timerStart$.next(true);
                    })
                  )
                )
              ),
              finalize(() => (this.isIdleDetected = false))
            )
          )
        )
      )
      .subscribe();

    this.setupTimer(this.timeout);
    this.setupPing(this.ping);
  }

  stopWatching() {
    this.stopTimer();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

  stopTimer() {
    this.isInactivityTimer = false;
    this.timerStart$.next(false);
  }

  resetTimer() {
    this.stopTimer();
    this.isTimeout = false;
  }

  /**
   * Return observable for timer's countdown number that emits after idle.
   */
  onTimerStart(): Observable<number> {
    return this.timerStart$.pipe(
      distinctUntilChanged(),
      switchMap(start => (start ? this.timer$ : of(null)))
    );
  }

  /**
   * Return observable for timeout is fired.
   */
  onTimeout(): Observable<boolean> {
    return this.timeout$.pipe(
      filter(timeout => !!timeout),
      tap(() => (this.isTimeout = true)),
      map(() => true)
    );
  }

  /**
   * Setup timer.
   *
   * Counts every seconds and return n+1 and fire timeout for last count.
   * @param timeout Timeout in seconds.
   */
  protected setupTimer(timeout: number) {
    this._ngZone.runOutsideAngular(() => {
      this.timer$ = interval(1000).pipe(
        take(timeout),
        map(() => 1),
        scan((acc, n) => acc + n),
        tap(count => {
          if (count === timeout) {
            this.timeout$.next(true);
          }
        })
      );
    });
  }

  /**
   * Setup ping.
   *
   * Pings every ping-seconds only if is not timeout.
   * @param ping
   */
  protected setupPing(ping: number) {
    this.ping$ = interval(ping * 1000).pipe(filter(() => !this.isTimeout));
  }
}