import { SearchInput } from '../../components/search-input/search-input';
import { ByLatestTable } from './../../components/by-latest-table/by-latest-table';
import { Component } from '@angular/core';

@Component({
  selector: 'by-latest-page',
  imports: [ByLatestTable, SearchInput],
  templateUrl: './by-latest-page.html',
})
export class ByLatestPage {}
