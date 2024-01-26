import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReadOnlyService {
    private readOnly = false;
  
    setReadOnly(value: boolean) {
      this.readOnly = value;
    }
  
    isReadOnly() {
      return this.readOnly;
    }

    clearReadOnly(clear: boolean = true) {
      if (clear) {
        this.readOnly = false;
      }
    }
  }