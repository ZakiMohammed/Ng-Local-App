import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from './models/note';
import { StorageService } from './services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Helper } from './models/helper';
import { Employee } from './models/employee';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  STORAGE_NOTE_LIST: string = 'noteList';
  STORAGE_EMPLOYEE: string = 'employee';
  
  time: string = '';
  date: string = '';
  intervalTime: any;
  index: number = -1;
  
  employee: Employee = null;

  note: Note = null;
  noteList: Note[] = [];
  filterNoteList: Note[] = [];
  tagList: string[] = [];

  hidForm: boolean = true;  
  hidInTime: boolean = true;
  isGrid: boolean = false;

  frm: FormGroup;

  _search: string = '';

  @ViewChild('txtTitle', { static: true }) txtTitle: ElementRef;
  @ViewChild('txtTag', { static: true }) txtTag: ElementRef;
  @ViewChild('txtInTime', { static: true }) txtInTime: ElementRef;

  get f() {
    return this.frm.controls;
  }
  get search(): string {
    return this._search;
  }
  set search(value: string) {
    this._search = value;
    value = value.toLocaleLowerCase();

    if(value === '') {
      this.filterNoteList = this.noteList.slice();
      return;
    }

    this.filterNoteList = this.noteList.filter(i => 
      i.title.toLocaleLowerCase().indexOf(value) !== -1 ||
      i.tags.findIndex(i => i.toLocaleLowerCase().indexOf(value) !== -1) !== -1
    );
  }
  
  constructor(
    private storageService: StorageService,
    private builder: FormBuilder) {

    this.noteList = <Note[]>this.storageService.getObject(this.STORAGE_NOTE_LIST) || [];
    this.employee = <Employee>this.storageService.getObject(this.STORAGE_EMPLOYEE) || new Employee();

    this.filterNoteList = this.noteList.slice();        
  }

  ngOnInit(): void {
    this.time = this.getTime();
    this.date = this.getDate();
    this.intervalTime = setInterval(() => this.time = this.getTime(), 1000);  

    this.frm = this.builder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['']      
    });
  }

  onAddClick($event: any) {
    this.hidForm = !this.hidForm;
    setTimeout(() => {
      this.txtTitle.nativeElement.focus();
    });
  }

  onTagAddClick($event: any) {
    let tag: string = $event.target.value;
    if (tag) {
      let found = this.tagList.find(i => i.toLocaleLowerCase() === tag.toLocaleLowerCase());
      if (!found) {
        this.tagList.push(tag.toLocaleLowerCase());
        $event.target.value = '';
      }
    }
  }

  onTagRemoveClick($event: any, index: number) {
    this.tagList.splice(index, 1);
  }

  onSubmit($event: any) {

    this.search = '';

    if (this.index === -1) {
      this.noteList.push({
        title: this.frm.value.title,
        body: this.frm.value.body,
        tags: this.tagList,
        created: new Date(),
        updated: new Date()
      });      
    } else {
      this.noteList[this.index] = {
        title: this.frm.value.title,
        body: this.frm.value.body,
        tags: this.tagList,
        created: this.note.created,
        updated: new Date()
      };
      this.note = null;
      this.index = -1;
    }

    this.filterNoteList = this.noteList.slice();
    
    this.storageService.setObject(this.STORAGE_NOTE_LIST, this.noteList);
    this.hidForm = !this.hidForm;
    this.frm.reset();
    this.tagList = [];
  }

  onResetClick($event: any) {
    this.frm.reset();
    this.tagList = [];
  }

  onCancelClick($event: any) {
    this.frm.reset();
    this.tagList = [];
    this.hidForm = true;
    this.note = null;
    this.index = -1;
  }

  onRemoveClick($event: any, note: Note) {

    let index = this.filterNoteList.findIndex(i => i.created === note.created);
    this.filterNoteList.splice(index, 1);

    index = this.noteList.findIndex(i => i.created === note.created);    
    this.noteList.splice(index, 1);
    this.storageService.setObject(this.STORAGE_NOTE_LIST, this.noteList);
  }
  
  onEditClick($event: any, note: Note) {
    this.index = this.noteList.findIndex(i => i.created === note.created);
    this.note = note;

    this.f.title.setValue(note.title);
    this.f.body.setValue(note.body);
    this.tagList = this.note.tags.slice();

    this.hidForm = !this.hidForm;

    window.scrollTo(0, 0);
  }

  onInTimeDoubleClick($event: any) {
    this.hidInTime = !this.hidInTime;
    this.txtInTime.nativeElement.value = this.employee.inTime;
    setTimeout(() => {
      this.txtInTime.nativeElement.focus();
    });
  }

  onInTimeKeyDown($event: any) {
    let inTime = $event.target.value;
    if (inTime) {
      this.employee.inTime = inTime;
      this.storageService.setObject(this.STORAGE_EMPLOYEE, this.employee);
      this.hidInTime = true;
    }
  }

  handleEnterKeyPress($event: any) {
    const tagName = $event.target.tagName.toLowerCase();
    if (tagName !== 'textarea') {
      return false;
    }
  }

  getTime() {
    return new Date().toLocaleTimeString().substr(0, 8);
  }

  getDate() {
    return new Date().toDateString();
  }

}
