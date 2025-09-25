import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ContentChild, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, TrackByFunction, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, debounceTime, takeUntil, combineLatest, BehaviorSubject, delay, ReplaySubject, Observable } from 'rxjs';
import { UiOverrideColumnDirective } from '../ui-override-column.directive';
import { UiActionsDirective } from '../ui-actions.directive';
import { UiHotpick } from '../ui-hotpick/ui-hotpick';

export interface EmptyReasonLabels {
  loading: string;
  emptyFilter: string;
  noData: string;
}

export type TableElement<T> = {
  field: keyof T | 'state';
  header: string;
  filterable?: boolean;
  visible?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  width?: string | number;
};

export type SelectionMode = 'None' | 'Clickable' | 'Single' | 'Multiple';
export type PageSize = 15 | 25 | 50;

@Component({
  selector: 'ui-table',
  standalone: false,
  templateUrl: './ui-table.html',
  styleUrl: './ui-table.scss'
})
export class UiTable<T extends object> implements AfterViewInit, AfterContentInit {
  
  private _elements: T[] | null = null;
  private _elementsByKey: Map<T[keyof T], T> | undefined;
  private _key?: keyof T;
  public dataSource = new MatTableDataSource<T>();

  hasActions = true;
  @Input()
  public set setDataSourceOverride(source: MatTableDataSource<any>) {
    this._dataSourceOverride = source;
    this.dataSource = source;
  }

  public _dataSourceOverride?: MatTableDataSource<T>;

  /**
   * The key of the object to use as the unique identifier for each row.
   */
  @Input()
  public set key(value: keyof T | undefined) {
    this._key = value;
    if (this._elements && value != undefined) {
      this._elementsByKey = this._createMap(this._elements, value);
    }
  }

  public get key(): keyof T | undefined {
    return this._key;
  }

  /**
   * When the key is not used in the table, you need to override the default sorting
   * with another column
   */
  @Input() public defaultSortActive?: string;
  @Input() public defaultSortDirection: 'asc' | 'desc' = 'asc';

  /**
   * The amount of elements to display in the table
   */
  @Input() public pageSize: PageSize | null = 15;
  @Input() public totalCount?: number;

  /**
   * Event emitted when the paginator changes the page size
   */
  @Output() public pageSizeChanged = new EventEmitter<PageSize>();

  /**
   * Event emitted when the paginator changes the page size or page index.
   */
  @Output() public pageChanged = new EventEmitter<PageEvent>();

  private _elementSubject = new ReplaySubject<T[] | null>(1);

  /**
   * The elements to display in the table.
   */
  @Input()
  public set elements(value: T[] | null) {
    this._elements = value;
    if (this.key && value != null) {
      this._elementsByKey = this._createMap(value, this.key);
    }
    this._elementSubject.next(this._elements);

    this._setSelectedElements();
  }

  public get elements(): T[] | null {
    return this._elements;
  }

  public get anythingSelected(): boolean {
    return this.selection.hasValue();
  }

  public get isAllSelected(): boolean {
    return (
      this.selection.selected.length === this.dataSource.filteredData.length
    );
  }

  /**
   * The columns to display in the table where the key is the column name and the value is the label in the header.
   * "select" is a required column since we're always rendering it.
   */
  #structure: TableElement<T>[] | null = [];
  @Input()
  public set structure(struc: TableElement<T>[] | null) {
    if (struc) {
      this.#structure = struc.map(s => ({
        field: s.field,
        header: s.header,
        filterable: s.filterable ?? true,
        visible: s.visible ?? true,
        exportable: s.exportable ?? true,
        sortable: s.sortable ?? true,
        width: s.width
      }));
    }
  }

  public get structure(): TableElement<T>[] | null {
    return this.#structure;
  }

  constructor(private _ref: ChangeDetectorRef) {}

  /**
   * Placeholder for the filter input
   */
  @Input()
  public filterPlaceholder = 'Search';

  /**
   * Labels for when the button is empty
   */
  @Input() public emptyReasonLabels: EmptyReasonLabels | null = {
    emptyFilter: '',
    loading: '',
    noData: ''
  };
  /**
   * Translated label for the filter input
   */
  @Input() public filterLabel = '';
  /**
   * Translated label for the select all button
   */
  @Input() public selectAllLabel = '';
  /**
   * Translated label for the deselect all button
   */
  @Input() public deselectLabel = '';

  /**
   * A list of elements that are currently selected in the table.
   * The key Input is used to determine if an element equals another element.
   */
  @Input()
  public set selectedElements(selectedElements: T[] | null) {
    this._selectedElements = selectedElements;
    this._setSelectedElements();
  }

  /**
   * If set to false, paging for the table will be turned off
   * default: true
   */
  @Input()
  public paging = true;

  /**
   * This sets the mode of selection,
   * - None: Nothing can be selected without the select column visible
   * - Clickable: Only allow 1 selection but without the select column visible
   * - Single: Only allow 1 selection with select column visible
   * - Multiple: Allow multiple rows selected with select column visible
   */
  @Input()
  public selectionMode: SelectionMode = 'None';

  @Input()
  public enableFilter = true;

  /**
   * If true, the hotpick component shall be shown in the searchbar, default false
   */
  @Input()
  public enableHotPick = false;
  @ContentChildren(UiHotpick) hotpicks!: QueryList<UiHotpick>;


  /**
   * If true, the filter component with hotpicks will not break on smaller screens, default false
   */
  @Input()
  public filterNoBreakpoint = false;

  /**
   * Predicate to filter elements by a certain field, if undefined, all elements will be shown
   */
  @Input()
  public dataFilter: Observable<((filter: T) => boolean) | undefined> =
    new BehaviorSubject(undefined);
  /**
   * When the selection changes due to human interaction (ie clicking a row or checkbox) the selectionChange event is emitted with the new selection.
   */
  @Output() public selectedElementsChanges = new EventEmitter<T[]>();

  @ViewChild(MatSort) public sort!: MatSort;
  @ViewChild(MatPaginator) public paginator!: MatPaginator;

  /**
   * Structural directive used to override columns based on the structure property name.
   */
  @ContentChildren(UiOverrideColumnDirective)
  public overrideColumns!: QueryList<UiOverrideColumnDirective>;

  private _overrideColumnsById: { [k: string]: UiOverrideColumnDirective } = {};

  private _selectedElements: T[] | null = null;

  public searchFieldControl = new FormControl('', { nonNullable: true });

  //deliberate use of any! otherwise it becomes very hard to track what is selected generically
  public selection = new SelectionModel<any>(true, []);

  private _destroySubject = new Subject<void>();
  public currentFilter = '';

  /**
   * function to override classes on certain rows (for example adding a disabled class if the entity is disabled)
   * @returns The classes to render on a row based on the row being rendered
   */
  @Input() private _rowClassSelector: (row: T) => string | null = () => null;

  public classesForRow(row: T): string | undefined {
    let classes = undefined;
    if (this._rowClassSelector) classes = this._rowClassSelector(row) ?? '';
    if (this.selectionMode == 'None') classes += ' not-selectable';
    if (this.key && this.selection.isSelected(row[this.key]))
      classes += ' selected';
    return classes;
  }

  public get columns(): { field: string; sortable: boolean }[] {
    if (this.structure) {
      return this.structure
        .filter(c => c.visible && c.field !== 'select')
        .map(x => ({
          field: x.field as string,
          sortable: x.sortable ?? true
        }));
    }
    return [];
  }

  public get allColumns(): string[] {
    let cols: string[];
    if (this.selectableColumnVisible)
     cols = ['select', ...this.columns.map(value => value.field)];
    else
      cols = this.columns.map(value => value.field);

    if (this.hasActions) {
      cols = [...cols, 'actions'];
    }

    return cols;
  }

  public structureValueFor(key: string): string | null | undefined {
    return this.structure
      ? this.structure.find(s => s.field === key)?.header
      : null;
  }

  public getWidthForColumn(key: string): string {
    const column = this.structure?.find(s => s.field === key);
    if (!column || !column.width) {
      return '1';
    }

    switch (typeof column.width) {
      case 'string':
        return `0 0 ${column.width}`;
      case 'number':
        return column.width.toString();
    }
  }

  public getTotalCount(): number {
    const currentCount =
      this.totalCount ?? this.dataSource.paginator?.length ?? 0;
    if (this.totalCount && this.dataSource.paginator) {
      this.dataSource.paginator.length = currentCount;
    }
    return currentCount;
  }

  public hasOverride(column: string): UiOverrideColumnDirective {
    return this._overrideColumnsById[column];
  }

  public get isClickable(): boolean {
    return this.selectionMode != 'None';
  }

  public get selectableColumnVisible(): boolean {
    return this.selectionMode == 'Multiple' || this.selectionMode == 'Single';
  }

  public get deselectVisible(): boolean {
    return this.selectionMode == 'Multiple';
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.searchFieldControl.valueChanges
      .pipe(debounceTime(50), takeUntil(this._destroySubject))
      .subscribe((value: string) => {
        this.currentFilter = value;
        this.dataSource.filter = value.trim().toLowerCase();
      });

    this.dataSource.sort = this.sort;

    if (!this._dataSourceOverride) {
      this.dataSource.sortData = this._sortData.bind(this);
      this.dataSource.sortingDataAccessor =
        this._sortingDataAccessor.bind(this);
      this.dataSource.filterPredicate = this._filterData.bind(this);

      combineLatest([this._elementSubject, this.dataFilter])
        //https://stackoverflow.com/questions/50283659/angular-6-mattable-performance-in-1000-rows/51296374#51296374
        //use delay(0) to create separate micro-task and change detection check.
        //This prevents performance issue with rendering huge amount of elements "before" the paginator and sorting have been set

        .pipe(delay(0), takeUntil(this._destroySubject))
        .subscribe(([elements, filter]) => {
          if (filter) {
            this.dataSource.data = elements?.filter(filter) ?? [];
          } else {
            this.dataSource.data = elements ?? [];
          }
          this._ref.markForCheck();
          this._setSelectedElements();
        });
    }
  }

  private _filterData(data: T, filter: string): boolean {
    const filteredKeys = Object.keys(data).filter(
      k =>
        this.structure
          ?.filter(s => s.filterable)
          .map(s => s.field)
          .some(c => c === k)
    );

    const filteredDataObject: { [key: string]: string } = {};
    for (const key of filteredKeys) {
      filteredDataObject[key] = (data as any)[key]?.toString();
    }
    const sanitizedData = Object.values(filteredDataObject)
      .join('◬') // stolen from the default implementation
      .toLowerCase();

    const sanitizedFilters = filter.trim().toLowerCase().split(' ');
    return sanitizedFilters.every(f => sanitizedData.includes(f));
  }

  public exportTable(tableName: string, addTimestamp = true): void {
    const exportableData: any[] = [];
    const allowedkeys =
      this.structure
        ?.filter(
          s => s.exportable && s.field !== 'select' && s.field !== 'state'
        )
        .map(ec => ec.field.toString()) ?? [];

    this.dataSource.filteredData.forEach(element => {
      const casted = element as unknown as { [key: string]: string };
      const exportableObject: { [key: string]: string } = {};
      for (const key of allowedkeys) {
        exportableObject[key] = casted[key];
      }

      exportableData.push(exportableObject);
    });

    const csv = this.convertToCSV(allowedkeys, exportableData);
    let filename = tableName;
    if (addTimestamp) {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      const formattedDate = `${year}${month}${day}-${hours}${minutes}`;
      filename += '-' + formattedDate;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.click();
  }

  public convertToCSV(headers: string[], data: any[]): string {
    let str = '';
    for (let i = 0; i < headers.length; i++) {
      const header =
        this.structure?.find(f => f.field === headers[i])?.header ?? headers[i];
      str += `"${header}"`;
      if (i === headers.length - 1) {
        str += '\r\n';
      } else {
        str += ',';
      }
    }
    for (let i = 0; i < data.length; i++) {
      let line = '';
      for (const index in data[i]) {
        if (line !== '') line += ',';
        line += `"${this.escapeSpecialCharacters(data[i][index])}"`;
      }

      str += line + '\r\n';
    }

    return str;
  }

  //Function to escape all special characters in a string for CSV
  public escapeSpecialCharacters<T>(str: T): T | string {
    if (typeof str === 'string') {
      const specialCharacters = [',', '"', '\r', '\n'];

      if (specialCharacters.some(char => str.includes(char))) {
        return str.replace(/"/g, '""');
      }
    }
    return str;
  }

@ContentChild(UiActionsDirective, { read: TemplateRef })
  actionsTemplate?: TemplateRef<any>;

  public ngAfterContentInit(): void {
    this.overrideColumns.forEach(c => {
      this._overrideColumnsById[c.field] = c;
    });
    this.hasActions = !!this.actionsTemplate;
  }

  public trackBy: TrackByFunction<T> = (_index: number, element: T) =>
    this.key ? element[this.key] : _index;

  public singleSelect(row: T): void {
    if (!this.key || this.selectionMode == 'None') return;

    if (this.selectionMode === 'Clickable') {
      this.selection.setSelection(row[this.key]);
      this.selectedElementsChanges.emit([row]);
      return;
    }

    const wasSelected = this.selection.isSelected(row[this.key]);
    const isMultiSelect = this.selection.selected.length > 1;

    if (isMultiSelect && !wasSelected) {
      this.toggleSelection(row);
      return;
    }
    if (isMultiSelect && wasSelected) {
      this.toggleSelection(row);
      return;
    }
    if (wasSelected) {
      this.selection.clear();
      this.selectedElementsChanges.emit([]);
      return;
    }
    this.selection.select(row[this.key]);
    this.selectedElementsChanges.emit([row]);
  }

  public toggleSelection(row: T): void {
    if (!this.key) return;
    if (this.selectionMode == 'Single') {
      if (this.selection.selected.some(c => c !== row[this.key!])) {
        this.selection.clear();
      }
    }
    this.selection.toggle(row[this.key]);

    const to = this.selection.selected
      .map(id => this._elementsByKey?.get(id))
      .filter(e => !!e) as T[];
    this.selectedElementsChanges.emit(to);
  }

  public emptyListReason(): string | undefined {
    if (!this.elements) return this.emptyReasonLabels?.loading;
    if (this.currentFilter !== '') return this.emptyReasonLabels?.emptyFilter;
    return this.emptyReasonLabels?.noData;
  }

  public deselectAll(): void {
    this.selection.clear();
    this.selectedElementsChanges.emit([]);
  }

  public async selectAll(): Promise<void> {
    if (!this.key) return;
    this.selectedElementsChanges.emit(this.dataSource.filteredData);
  }

  private _setSelectedElements(): void {
    if (!this.key) return;
    this.selection.clear();
    if (this._selectedElements == null) return;

    const elements = this._createMap(this._selectedElements, this.key!);

    const selected = this.dataSource.data?.filter(l =>
      elements!.get(l[this.key!])
    );
    this.selection.select(...selected.map(s => s[this.key!]));
  }

  private _sortData(data: T[], sort: MatSort): T[] {
    const active = sort.active;
    const direction = sort.direction;

    if (!active || direction === '') {
      // No sorting needed
      return data;
    }

    return data.sort((a, b) => {
      const valueA = this._sortingDataAccessor(a, active);
      const valueB = this._sortingDataAccessor(b, active);

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // When comparing string values, we do it in a "natural" way
        // meaning numeric parts are compared as numeric values
        // Result:
        // - "Dummy"
        // - "Dummy 1"
        // - "Dummy 2"
        // - "Dummy 10"
        return direction === 'desc'
          ? this._naturalCompare(valueB, valueA)
          : this._naturalCompare(valueA, valueB);
      } else {
        return direction === 'desc'
          ? this._defaultCompare(valueB, valueA)
          : this._defaultCompare(valueA, valueB);
      }
    });
  }

  private _naturalCompare(a: string, b: string): number {
    a = a.toLowerCase();
    b = b.toLowerCase();
    // This comparison method takes a locale to compare string values.
    // For now it's left undefined so the default locale of the JavaScript runtime is used.
    return a.localeCompare(b, undefined, { numeric: true });
  }

  private _defaultCompare(a: any, b: any): number {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  private _sortingDataAccessor(data: T, sortHeaderId: string): any {
    if (sortHeaderId === 'select') {
      return this.selection.isSelected(data[this.key!]) ? 1 : 0;
    }
    const override = this.hasOverride(sortHeaderId);
    if (override && override.uiOverrideColumnOverrideSortHeader) {
      return data[override.uiOverrideColumnOverrideSortHeader as keyof T];
    }
    return data[sortHeaderId as keyof T];
  }

  public pageChangedEvent(event: PageEvent): void {
    this.pageChanged.emit(event);
    if (this.pageSize != event.pageSize) {
      this.pageSize = event.pageSize as PageSize;
      this.pageSizeChanged.emit(event.pageSize as PageSize);
    }
  }

  private _createMap(values: T[], key: keyof T): Map<T[keyof T], T> {
    return new Map(values.map(v => [v[key], v]));
  }
}
