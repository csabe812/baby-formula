import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { FormulaData } from '../model/formula-data';

@Component({
  selector: 'app-add-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
  providers: [DataService],
})
export class AddComponent implements OnDestroy {
  addDataSubscription?: Subscription;
  today: string = new Date().toISOString().split('T')[0];

  form: FormGroup = new FormGroup({
    recorded: new FormControl(this.today),
    timeAndMinutes: new FormControl(),
    taken: new FormControl(),
    other: new FormControl(),
  });

  constructor(private dataService: DataService) {}

  ngOnDestroy(): void {
    this.addDataSubscription?.unsubscribe();
  }

  saveData(): void {
    const data: FormulaData = {
      recorded: this.form.controls.recorded.value ?? this.today,
      timeAndMinutes: this.form.controls.timeAndMinutes.value ?? '',
      taken: this.form.controls.taken.value ?? 0,
      other: this.form.controls.other.value ?? '',
    };
    this.addDataSubscription = this.dataService
      .addData(data)
      .subscribe((resp) => {
        this.form.reset();
        this.form.controls.recorded.setValue(this.today);
      });
  }
}
