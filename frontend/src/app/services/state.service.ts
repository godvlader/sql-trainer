import { Injectable } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";

@Injectable({ providedIn: 'root' })
export class StateService {
    public userListState = new MatTableState('pseudo', 'asc', 5);
    public quizListState = new MatTableState('name', 'asc', 5);
    
}
