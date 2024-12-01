import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AddressService } from './address.service';

@NgModule({
  imports: [HttpClientModule], // Ensures HttpClient is available
  providers: [AddressService], // Makes AddressService injectable
})
export class AddressModule {}
