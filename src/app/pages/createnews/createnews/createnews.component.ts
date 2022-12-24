import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { CreatenewsService } from '../../createnews/createnews.service';

@Component({
  selector: 'fury-createnews',
  templateUrl: './createnews.component.html',
  styleUrls: ['./createnews.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation],
  encapsulation: ViewEncapsulation.None
})
export class CreatenewsComponent implements OnInit {

  text='';

  type;
  newsTitle;
  userId;

  form = new FormControl(this.text);
  public txtForm: FormGroup;

  constructor(  private fb: FormBuilder,
    private newsService: CreatenewsService,
    private snackbar: MatSnackBar,
    private cookieService: CookieService) { }

  ngOnInit(): void {

    this.userId= this.cookieService.get('userId');

    this.txtForm = this.fb.group({
      newsTitle: [null, Validators.compose([Validators.required ])],
      type: [null, Validators.compose([Validators.required ])],
      form: [null, Validators.compose([Validators.required ])],
    });
    
  }

  
  popupMsg(type,msg){

    let snackbarColor;
    if(type=='error'){
      snackbarColor='red-snackbar';
    }
    else if(type=='success'){
      snackbarColor='green-snackbar';
    }
    this.snackbar.open(msg, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [snackbarColor],
    });
  }

  
  saveData(){

    let dctNews={};
   
    dctNews['title']= this.newsTitle;
    dctNews['type']= this.type;
    dctNews['content']= this.text;
    dctNews['createdUser']= this.userId;

    this.newsService.createNews(dctNews).subscribe((data: any) => {
      if(data) {
        this.popupMsg('success','Data saved Successfully');
        this.cancelData();
      }
    })

  }

  cancelData(){
    
    this.text='';
    this.newsTitle='';
    this.type='';
 
  }

}
