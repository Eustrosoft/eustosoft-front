import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ExplorerService } from '../../services/explorer.service';
import { Observable } from 'rxjs';
import {
  FileSystemObject,
  FileSystemObjectTypes,
} from '@eustrosoft-front/core';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'eustrosoft-front-move-folder-dialog',
  templateUrl: './move-folder-dialog.component.html',
  styleUrls: ['./move-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveFolderDialogComponent implements OnInit {
  fsObjects$!: Observable<FileSystemObject[]>;
  fsObjTypes = FileSystemObjectTypes;

  @ViewChild(MatSelectionList) matSelectionList!: MatSelectionList;

  private dialogRef: MatDialogRef<MoveFolderDialogComponent> = inject(
    MatDialogRef<MoveFolderDialogComponent>
  );
  private explorerService: ExplorerService = inject(ExplorerService);

  ngOnInit(): void {
    this.fsObjects$ = this.explorerService.getFsObjects('/');
  }

  selectionChange(v: unknown): void {
    console.log(v);
  }

  close(): void {
    this.dialogRef.close();
  }
}
