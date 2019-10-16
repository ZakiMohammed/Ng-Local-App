import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from './models/note';
import { StorageService } from './services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Helper } from './models/helper';
import { User } from './models/user';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  STORAGE_NOTE_LIST: string = 'noteList';
  STORAGE_USER: string = 'user';
  STORAGE_LAYOUT: string = 'layout';

  time: string = '';
  date: string = '';
  intervalTime: any;
  index: number = -1;

  user: User = null;
  defaultUser: User;

  note: Note = null;
  noteList: Note[] = [];
  filterNoteList: Note[] = [];
  tagList: string[] = [];

  hidForm: boolean = true;
  hidInTime: boolean = true;
  isGrid: boolean = false;

  showModal: boolean = false;

  frm: FormGroup;
  frmModal: FormGroup;

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

    if (value === '') {
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
    this.user = <User>this.storageService.getObject(this.STORAGE_USER) || new User();
    this.isGrid = <boolean>this.storageService.getText(this.STORAGE_LAYOUT) || false;

    this.filterNoteList = this.noteList.slice();
    this.defaultUser = new User();
  }

  ngOnInit(): void {
    this.time = this.getTime();
    this.date = this.getDate();
    this.intervalTime = setInterval(() => this.time = this.getTime(), 1000);

    this.frm = this.builder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['']
    });
    this.frmModal = this.builder.group({
      id: [this.user.id],
      name: [this.user.name],
      url: [this.user.image]
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

  onModalSubmit($event: any) {
    this.user = {
      id: this.frmModal.value.id,
      name: this.frmModal.value.name,
      image: this.frmModal.value.url
    };
    this.storageService.setObject(this.STORAGE_USER, this.user);
    this.showModal = false;
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

  onLayoutClick($event: any, isGrid: boolean) {
    this.isGrid = isGrid;
    this.storageService.setText(this.STORAGE_LAYOUT, this.isGrid);
  }

  onProfileModalOpenClick($event: any) {
    this.showModal = true;
  }

  onProfileModalCloseClick($event: any) {
    this.showModal = false;
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
