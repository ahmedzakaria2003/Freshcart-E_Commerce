import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-auctions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit {
  private readonly _FormBuilder = inject(FormBuilder);
  auctions: any[] = [];
  auctionForm!: FormGroup;
  isEditing = false;
  selectedAuctionId: number | null = null;
  isCriticalFieldsDisabled = false; 
  imagePreview: string | ArrayBuffer | null = null;
  minDateTime: string = '';

  private getCurrentDateTimeLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit() {
    this.initForm();
    this.minDateTime = this.getCurrentDateTimeLocal(); 
    this.loadAuctionsFromStorage();
  }

  initForm() {
    this.auctionForm = this._FormBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      category: ['', Validators.required],
      startingBid: [0, [
        Validators.required,
        Validators.min(1)
      ]],
      imageUrl: ['', Validators.required],
      location: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/)
      ]],
      endTime: ['', Validators.required],
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type!',
          text: 'Please upload a valid image file (jpg, png, gif).'
        });
        this.auctionForm.patchValue({ imageUrl: "" });
        this.imagePreview = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.auctionForm.patchValue({
          imageUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  createAuction() {
    const selectedEndTime = new Date(this.auctionForm.value.endTime);
    const currentDateTime = new Date(this.getCurrentDateTimeLocal());

    if (selectedEndTime <= currentDateTime) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid End Time',
        text: 'End time must be in the future.',
      });
      return;
    }

    if (this.auctionForm.invalid) {
      this.auctionForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    const newAuction = {
      id: this.auctions.length + 1,
      ...this.auctionForm.value,
      currentBid: this.auctionForm.value.startingBid,
      bids: [],
      status: 'Open',
      winner: null,
      winnerAmount: 0,
    };

    this.auctions.push(newAuction);
    this.saveToLocalStorage();
    this.auctionForm.reset();
    this.imagePreview = null;

    Swal.fire({
      icon: 'success',
      title: 'Auction Created!',
      text: 'Your auction has been successfully added.',
    });
  }

  updateAuction() {
    const selectedEndTime = new Date(this.auctionForm.value.endTime);
    const currentDateTime = new Date(this.getCurrentDateTimeLocal());

    if (selectedEndTime <= currentDateTime) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid End Time',
        text: 'End time must be in the future.',
      });
      return;
    }

    if (this.auctionForm.invalid || this.selectedAuctionId === null) {
      this.auctionForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    const index = this.auctions.findIndex(a => a.id === this.selectedAuctionId);
    if (index !== -1) {
      if (this.getAuctionStatus(this.auctions[index]) === 'Closed') {
        Swal.fire({
          icon: 'warning',
          title: 'Update Not Allowed!',
          text: 'You cannot update a closed auction.',
        });
        return;
      }

      const originalAuction = this.auctions[index];
      const originalStartingBid = originalAuction.startingBid;
      const originalEndTime = originalAuction.endTime;

      const formValue = this.auctionForm.value;
      // تحقق من التغيير في الحقول المسموح بها
      const hasChanges = formValue.name !== originalAuction.name ||
                        formValue.category !== originalAuction.category ||
                        formValue.imageUrl !== originalAuction.imageUrl ||
                        formValue.location !== originalAuction.location;

      if (!hasChanges) {
        Swal.fire({
          icon: 'info',
          title: 'No Changes!',
          text: 'No changes have been made to update.',
        });
        return;
      }

      if ((this.auctionForm.get('startingBid')?.enabled && formValue.startingBid !== originalStartingBid) ||
          (this.auctionForm.get('endTime')?.enabled && formValue.endTime !== originalEndTime)) {
        Swal.fire({
          icon: 'warning',
          title: 'Update Restricted!',
          text: 'You cannot modify the starting bid or end time of an auction.',
        });
        return; 
      }

      this.auctions[index] = {
        ...this.auctions[index],
        name: formValue.name,
        category: formValue.category,
        imageUrl: formValue.imageUrl,
        location: formValue.location,
      };

      this.saveToLocalStorage();
      this.isEditing = false;
      this.isCriticalFieldsDisabled = false;
      this.selectedAuctionId = null;
      this.auctionForm.reset();
      this.imagePreview = null;
      this.auctionForm.get('startingBid')?.enable();
      this.auctionForm.get('endTime')?.enable();

      Swal.fire({
        icon: 'success',
        title: 'Auction Updated!',
        text: 'Your auction has been successfully updated.',
      });
    }
  }

  deleteAuction(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this auction?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auctions = this.auctions.filter(a => a.id !== id);
        this.saveToLocalStorage();
        Swal.fire(
          'Deleted!',
          'Your auction has been deleted.',
          'success'
        );
      }
    });
  }

  editAuction(auction: any) {
    if (this.getAuctionStatus(auction) === 'Closed') {
      Swal.fire({
        icon: 'warning',
        title: 'Editing Not Allowed!',
        text: 'You cannot edit a closed auction.',
      });
      return;
    }

    this.isEditing = true;
    this.selectedAuctionId = auction.id;
    this.isCriticalFieldsDisabled = true;

    const endTime = new Date(auction.endTime);
    const formattedEndTime = endTime.toISOString().slice(0, 16);

    this.auctionForm.get('startingBid')?.disable();
    this.auctionForm.get('endTime')?.disable();

    this.auctionForm.patchValue({
      ...auction,
      endTime: formattedEndTime
    });

    this.imagePreview = auction.imageUrl;
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('auctions', JSON.stringify(this.auctions));
    } catch (error) {
      console.error("❌ ", error);
    }
  }

  private loadAuctionsFromStorage() {
    try {
      const storedAuctions = localStorage.getItem('auctions');
      if (storedAuctions) {
        this.auctions = JSON.parse(storedAuctions);
      }
    } catch (error) {
      console.error("❌ ", error);
    }
  }

  getAuctionStatus(auction: any): string {
    const endTime = new Date(auction.endTime).getTime();
    const currentTime = new Date().getTime();
    return currentTime >= endTime ? 'Closed' : 'Open';
  }

  getWinner(auction: any): string {
    return auction.winner ? `${auction.winner}` : 'No winner yet';
  }
}