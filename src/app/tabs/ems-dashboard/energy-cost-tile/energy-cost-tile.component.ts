import { Component, Input, OnInit } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { getClientDataFormat } from '../../shared/utilities/utility';

@Component({
  selector: 'fury-energy-cost-tile',
  templateUrl: './energy-cost-tile.component.html',
  styleUrls: ['./energy-cost-tile.component.scss']
})
export class EnergyCostTileComponent implements OnInit {

  @Input() costLabel: string;
  @Input() energyCost: number = 0;
  currency = '';

  constructor(private envService: EnvService) {
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
  }

  ngOnInit(): void {
  }

}
