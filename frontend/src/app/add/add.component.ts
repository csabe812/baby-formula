import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class AddComponent implements OnInit, OnDestroy {
  addDataSubscription?: Subscription;
  today: string = new Date().toISOString().split('T')[0];
  id?: number;
  isLoading: boolean = false;

  form: FormGroup = new FormGroup({
    recorded: new FormControl(this.today, [
      Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
      Validators.required,
    ]),
    hourAndMinutes: new FormControl(),
    taken: new FormControl(),
    eaten: new FormControl(),
    other: new FormControl(),
  });

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.dataService.findByPk(this.id).subscribe((data) => {
        this.form.patchValue(data);
      });
    });
  }

  ngOnDestroy(): void {
    this.addDataSubscription?.unsubscribe();
  }

  saveData(): void {
    this.isLoading = true;
    const data: FormulaData = {
      recorded: this.form.controls.recorded.value ?? this.today,
      hourAndMinutes: this.form.controls.hourAndMinutes.value ?? '',
      taken: this.form.controls.taken.value ?? 0,
      other: this.form.controls.other.value ?? '',
      eaten: this.form.controls.eaten.value ?? '',
    };
    if (this.id) {
      data.id = this.id;
      this.addDataSubscription = this.dataService
        .put(data)
        .subscribe((resp) => {
          this.isLoading = false;
          this.router.navigate(['/']);
        });
    } else {
      this.addDataSubscription = this.dataService
        .create(data)
        .subscribe((resp) => {
          this.isLoading = false;
          this.router.navigate(['/']);
        });
    }
  }

  onKeyupEvent(event: any) {
    let hourAndMinutes = this.form.controls.hourAndMinutes.value;
    if (hourAndMinutes) {
      if (
        hourAndMinutes.length === 5 &&
        hourAndMinutes.split(':')[0].length === 2
      ) {
        return;
      }
      if (hourAndMinutes.length > 4) {
        this.form.controls.hourAndMinutes.patchValue('');
        return;
      }
      hourAndMinutes = ('' + hourAndMinutes).replace(':', '');
      if (hourAndMinutes.length === 3) {
        hourAndMinutes = '0' + hourAndMinutes;
      }
      const firstPart = hourAndMinutes.slice(0, 2);
      const secondPart = hourAndMinutes.slice(2, 4);
      this.form.controls.hourAndMinutes.patchValue(
        firstPart + ':' + secondPart
      );
    }
  }
}
