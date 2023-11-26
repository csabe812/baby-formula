import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { Observable, Subscription, map, of } from 'rxjs';
import { FormulaData } from '../model/formula-data';
import { HttpClientModule } from '@angular/common/http';
import { NoDataPipe } from '../pipe/no-data.pipe';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AsyncPipe,
    HttpClientModule,
    NoDataPipe,
    NgbDatepickerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [DataService],
})
export class HomeComponent implements OnInit, OnDestroy {
  private modalService = inject(NgbModal);
  closeResult = '';

  data$: Observable<FormulaData[]> = of([]);
  sumTaken = 0;
  deleteSubscription?: Subscription;

  id?: number;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }

  fetchData() {
    this.sumTaken = 0;
    this.data$ = this.dataService.fetchDataByDate(new Date()).pipe(
      map((m) => {
        for (let i of m) {
          this.sumTaken += i.taken;
        }
        return m;
      })
    );
  }

  deleteData() {
    this.deleteSubscription = this.dataService
      .deleteById(this.id!)
      .subscribe((data) => {
        this.fetchData();
      });
  }

  open(content: TemplateRef<any>, id: number) {
    this.id = id;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
}
