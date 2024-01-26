import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import * as _ from 'lodash-es';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { StateService } from 'src/app/services/state.service';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { plainToClass } from 'class-transformer';
import { format, formatISO } from 'date-fns';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
    selector: 'app-userlist',
    templateUrl: './userlist.component.html',
    styleUrls: ['./userlist.component.css']
})
export class UserListComponent implements AfterViewInit, OnDestroy {
    displayedColumns: string[] = ['pseudo', 'fullName', 'birthDate', 'role', 'actions'];
    dataSource: MatTableDataSource<User> = new MatTableDataSource();
    filter: string = '';
    state: MatTableState;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private userService: UserService,
        private stateService: StateService,
        private authService: AuthenticationService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar
    ) {
        this.state = this.stateService.userListState;
    }

    ngAfterViewInit(): void {
        // lie le datasource au sorter et au paginator
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // définit le predicat qui doit être utilisé pour filtrer les users
        this.dataSource.filterPredicate = (data: User, filter: string) => {
            const str = data.pseudo + ' ' + data.fullName + ' ' + (data.birthDate ? format(data.birthDate!, 'dd/MM/yyyy') : '') + ' ' + data.roleAsString;
            return str.toLowerCase().includes(filter);
        };
        // établit les liens entre le data source et l'état de telle sorte que chaque fois que 
        // le tri ou la pagination est modifié l'état soit automatiquement mis à jour
        this.state.bind(this.dataSource);
        // récupère les données 
        this.refresh();
    }

    refresh() {
        this.userService.getAll().subscribe(users => {
            // assigne les données récupérées au datasource
            this.dataSource.data = users;
            // restaure l'état du datasource (tri et pagination) à partir du state
            this.state.restoreState(this.dataSource);
            // restaure l'état du filtre à partir du state
            this.filter = this.state.filter;
        });
    }

    // appelée chaque fois que le filtre est modifié par l'utilisateur
    filterChanged(e: KeyboardEvent) {
        const filterValue = (e.target as HTMLInputElement).value;
        // applique le filtre au datasource (et provoque l'utilisation du filterPredicate)
        this.dataSource.filter = filterValue.trim().toLowerCase();
        // sauve le nouveau filtre dans le state
        this.state.filter = this.dataSource.filter;
        // comme le filtre est modifié, les données aussi et on réinitialise la pagination
        // en se mettant sur la première page
        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }

    // appelée quand on clique sur le bouton "edit" d'un user
    edit(user: User) {
        const dlg = this.dialog.open(EditUserComponent, { data: { user, isNew: false } });
        dlg.beforeClosed().subscribe(res => {
            if (res) {
                _.assign(user, res);
                this.userService.update(user).subscribe(
                    success => {
                      if (success) {
                        this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
                      } else {
                        this.snackBar.open('Failed to update user.', 'Close', { duration: 3000 });
                        this.refresh();
                      }
                    },
                    error => {
                      console.error(error);
                      this.snackBar.open('An error occurred during the update.', 'Close', { duration: 3000 });
                      this.refresh();
                    }
                  );
            }
        });
    }

    // appelée quand on clique sur le bouton "delete" d'un user
    delete(user: User) {
        const backup = this.dataSource.data;
        this.dataSource.data = _.filter(this.dataSource.data, u => u.pseudo !== user.pseudo);
        const snackBarRef = this.snackBar.open(`User '${user.pseudo}' will be deleted`, 'Undo', { duration: 10000 });
        snackBarRef.afterDismissed().subscribe(res => {
            if (!res.dismissedByAction)
                this.userService.delete(user).subscribe();
            else
                this.dataSource.data = backup;
        });
    }

    isLoggedUser(user: User): boolean {
        return this.authService.currentUser?.pseudo == user.pseudo;
    }

    // appelée quand on clique sur le bouton "new user"
    create() {
        const user = new User();
        const dlg = this.dialog.open(EditUserComponent, { data: { user, isNew: true } });
        dlg.beforeClosed().subscribe(res => {
            if (res) {
                res = plainToClass(User, res);
                this.dataSource.data = [...this.dataSource.data, res];
                this.userService.add(res).subscribe(res => {
                    if (!res) {
                        this.snackBar.open(`There was an error at the server. The user has not been created! Please try again.`, 'Dismiss', { duration: 10000 });
                        this.refresh();
                    }
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
    }
}
