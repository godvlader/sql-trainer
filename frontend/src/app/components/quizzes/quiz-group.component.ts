import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { Quiz } from 'src/app/models/quiz';

@Component({
    selector: 'quiz-group',
    templateUrl: './quiz-group.component.html',
    styleUrls: ['./quiz-group.component.css']
})

export class QuizGroupComponent{
    @Output() askDuplicate: EventEmitter<void> = new EventEmitter<void>();
    @Output() askDelete: EventEmitter<void> = new EventEmitter<void>();
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    private _filter: string='';
    route: any;

    get filter(): string {
        return this._filter;
    }
    
    filterChanged(e: KeyboardEvent) {
        const filterValue = (e.target as HTMLInputElement).value;
        // applique le filtre au datasource (et provoque l'utilisation du filterPredicate)
        this.dataSource.filter = filterValue.trim().toLowerCase();
        // sauve le nouveau filtre dans le state
        this._filter = this.dataSource.filter;
        // comme le filtre est modifié, les données aussi et on réinitialise la pagination
        // en se mettant sur la première page
        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }
    
}
