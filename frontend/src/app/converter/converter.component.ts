import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './converter.component.html',
  styleUrl: './converter.component.scss',
})
export class ConverterComponent {
  waterAmount: number = 0;
  extraWaterAmount: number = 0;
  remainedWaterAmount: number = 0;
  numberOfCups: number = 0;
  babyFormulaTaken: number = 0;
  waterTaken: number = 0;

  onWaterAmountChanged(event: Event) {
    this.waterAmount = +(event.target as HTMLInputElement).value;
    this.numberOfCups = Math.round((this.waterAmount / 21) * 100) / 100;
  }

  onExtraWaterAmountChanged(event: Event) {
    this.extraWaterAmount = +(event.target as HTMLInputElement).value;
  }

  onRemainedWaterAmountChanged(event: Event) {
    this.remainedWaterAmount = +(event.target as HTMLInputElement).value;
    this.calculateWater();
  }

  calculateWater() {
    const sumOfWater = this.waterAmount + this.extraWaterAmount;
    this.babyFormulaTaken =
      Math.round(
        ((sumOfWater - this.remainedWaterAmount) / sumOfWater) *
          this.waterAmount *
          100
      ) / 100;
    this.waterTaken =
      Math.round(
        ((sumOfWater - this.remainedWaterAmount) / sumOfWater) *
          this.extraWaterAmount *
          100
      ) / 100;
  }
}
