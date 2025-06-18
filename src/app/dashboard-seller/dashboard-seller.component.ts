import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-seller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-seller.component.html',
  styleUrls: ['./dashboard-seller.component.scss']
})
export class DashboardSellerComponent implements OnInit {
  private readonly _FormBuilder = inject(FormBuilder);
  private getCurrentDateTimeLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  auctionn: any[] = [];
  auctionForm!: FormGroup;
  isEditing = false;
  selectedAuctionId: number | null = null;
  currentSellerId: string | null = null;
  isCriticalFieldsDisabled = false;
  imagePreview: string | ArrayBuffer | null = null;
  minDateTime: string = '';

  ngOnInit() {
    this.initForm();
    this.currentSellerId = this.getSellerIdFromToken();
    this.minDateTime = this.getCurrentDateTimeLocal(); 
    this.loadAuctionsFromStorage();
  }

  initForm() {
    this.auctionForm = this._FormBuilder.group({
      name: ["", [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      category: ["", Validators.required],
      startingBid: [0, [
        Validators.required,
        Validators.min(1)
      ]],
      imageUrl: ["", Validators.required],
      location: ["", [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/)
      ]],
      endTime: ["", Validators.required],
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

    if (this.auctionForm.invalid || !this.currentSellerId) {
      this.auctionForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    let sellerAuctions = JSON.parse(localStorage.getItem(`auctions-seller-${this.currentSellerId}`) || "[]");

    const newAuction = {
      id: Date.now(),
      ...this.auctionForm.value,
      currentBid: this.auctionForm.value.startingBid,
      bids: [],
      status: 'Open',
      winner: null,
      winnerAmount: 0,
      sellerId: this.currentSellerId
    };

    sellerAuctions.push(newAuction);
    localStorage.setItem(`auctions-seller-${this.currentSellerId}`, JSON.stringify(sellerAuctions));
    this.loadAuctionsFromStorage();
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

    if (this.auctionForm.invalid || this.selectedAuctionId === null || !this.currentSellerId) {
      this.auctionForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill all required fields correctly.',
      });
      return;
    }

    let sellerAuctions = JSON.parse(localStorage.getItem(`auctions-seller-${this.currentSellerId}`) || "[]");
    const index = sellerAuctions.findIndex((a: any) => a.id === this.selectedAuctionId);

    if (index !== -1) {
      if (this.getAuctionStatus(sellerAuctions[index]) === 'Closed') {
        Swal.fire({
          icon: 'warning',
          title: 'Update Not Allowed!',
          text: 'This auction has ended and cannot be updated.',
        });
        return;
      }

      const originalAuction = sellerAuctions[index];
      const formValue = this.auctionForm.value;

      // تحقق من التغيير في الحقول المسموح بها مع إزالة الفراغات
      const hasChanges = formValue.name.trim() !== originalAuction.name.trim() ||
                        formValue.category.trim() !== originalAuction.category.trim() ||
                        formValue.imageUrl !== originalAuction.imageUrl ||
                        formValue.location.trim() !== originalAuction.location.trim();

      console.log("Original:", originalAuction);
      console.log("Form Value:", formValue);
      console.log("Has Changes:", hasChanges);

      if (!hasChanges) {
        Swal.fire({
          icon: 'info',
          title: 'No Changes!',
          text: 'No changes have been made to update.',
        });
        return;
      }

      if ((this.auctionForm.get('startingBid')?.enabled && formValue.startingBid !== originalAuction.startingBid) ||
          (this.auctionForm.get('endTime')?.enabled && formValue.endTime !== originalAuction.endTime)) {
        Swal.fire({
          icon: 'warning',
          title: 'Update Restricted!',
          text: 'You cannot modify the starting bid or end time of an auction.',
        });
        return;
      }

      sellerAuctions[index] = {
        ...sellerAuctions[index],
        name: formValue.name,
        category: formValue.category,
        imageUrl: formValue.imageUrl,
        location: formValue.location,
      };

      localStorage.setItem(`auctions-seller-${this.currentSellerId}`, JSON.stringify(sellerAuctions));
      this.loadAuctionsFromStorage();

      this.isEditing = false;
      this.selectedAuctionId = null;
      this.isCriticalFieldsDisabled = false;
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

  deleteAuction(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this auction?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed && this.currentSellerId) {
        let sellerAuctions = JSON.parse(localStorage.getItem(`auctions-seller-${this.currentSellerId}`) || "[]");
        sellerAuctions = sellerAuctions.filter((a: any) => a.id !== id);
        localStorage.setItem(`auctions-seller-${this.currentSellerId}`, JSON.stringify(sellerAuctions));
        this.loadAuctionsFromStorage();

        Swal.fire(
          'Deleted!',
          'Your auction has been deleted.',
          'success'
        );
      }
    });
  }

  private loadAuctionsFromStorage() {
    if (this.currentSellerId) {
      try {
        const storedAuctions = localStorage.getItem(`auctions-seller-${this.currentSellerId}`);
        if (storedAuctions) {
          this.auctionn = JSON.parse(storedAuctions);
        }
      } catch (error) {
        console.error("❌ ", error);
      }
    }
  }

  private getSellerIdFromToken(): string | null {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload.id || null;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  }

  getAuctionStatus(auction: any): string {
    const currentTime = new Date().getTime();
    const auctionEndTime = new Date(auction.endTime).getTime();

    if (currentTime >= auctionEndTime) {
      auction.status = "Closed";
      return "Closed";
    } else {
      auction.status = "Open";
      return "Open";
    }
  }

  getWinner(auction: any): string {
    return auction.winner ? auction.winner : 'No winner yet';
  }

  getWinningBid(auction: any): string {
    return auction.winnerAmount ? `$${auction.winnerAmount}` : 'N/A';
  }

  trackById(index: number, auction: any): number {
    return auction.id;
  }
}