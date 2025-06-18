// import { CommonModule } from '@angular/common';
// import { Component, inject } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// @Component({
//   selector: 'app-dash-seller',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './dash-seller.component.html',
//   styleUrls: ['./dash-seller.component.scss']
// })
// export class DashSellerComponent {
//   private readonly _FormBuilder = inject(FormBuilder);
//   auctionn: any[] = [];
//   auctionForm!: FormGroup;
//   isEditing = false;
//   selectedAuctionId: number | null = null;
//   isEndTimeDisabled = false;

//   ngOnInit() {
//     this.initForm();
//     this.loadAuctionsFromStorage();
//   }

//   initForm() {
//     this.auctionForm = this._FormBuilder.group({
//       name: ["", Validators.required],
//       category: ["", Validators.required],
//       startingBid: [0, [Validators.required, Validators.min(1)]],
//       imageUrl: ["", Validators.required],
//       location: ["", Validators.required],
//       endTime: ["", Validators.required],
//       status: ["Open"],
//       winner: [null],
//       winnerAmount: [0],
//     });
//   }

//   createAuction() {
//     if (this.auctionForm.valid) {
//       const newAuction = {
//         id: Date.now(),
//         startTime: new Date().toISOString(),  
//         ...this.auctionForm.value,
//         endTime: new Date(this.auctionForm.value.endTime).toISOString(),
//         currentBid: this.auctionForm.value.startingBid,
//         bids: [],
//       };

//       this.auctionn.push(newAuction);
//       this.saveToLocalStorage();
//       this.auctionForm.reset();

//       localStorage.setItem(`auctionStartTime_${newAuction.id}`, newAuction.startTime);
//     } else {
//       alert("Please fill all required fields correctly.");
//     }
//   }

//   updateAuction() {
//     const auctionStartTime = localStorage.getItem(`auctionStartTime_${this.selectedAuctionId}`);
//     if (auctionStartTime && new Date(auctionStartTime).getTime() < Date.now()) {
//       alert("You cannot modify the auction time after it has started.");
//       return;
//     }

//     alert("You cannot update an auction after it has been created.");
//     return;
//   }

//   editAuction(auction: any) {
//     const auctionStartTime = localStorage.getItem(`auctionStartTime_${auction.id}`);
//     if (auctionStartTime && new Date(auctionStartTime).getTime() < Date.now()) {
//       alert("You cannot modify the auction time after it has started.");
//       return;
//     }

//     this.isEditing = true;
//     this.selectedAuctionId = auction.id;

//     const currentTime = new Date();
//     const startTime = new Date(auction.startTime);
//     const endTime = new Date(auction.endTime);

//     this.isEndTimeDisabled = true; 
//     const endTimeFormatted = endTime.toISOString().slice(0, 16);

//     this.auctionForm.patchValue({
//       ...auction,
//       endTime: endTimeFormatted,
//     });
//   }

//   deleteAuction(id: number) {
//     this.auctionn = this.auctionn.filter(a => a.id !== id);
//     this.saveToLocalStorage();
//   }

//   private saveToLocalStorage() {
//     try {
//       localStorage.setItem("auctions-seller", JSON.stringify(this.auctionn));
//     } catch (error) {
//       console.error("❌ ", error);
//     }
//   }

//   private loadAuctionsFromStorage() {
//     try {
//       const storedAuctions = localStorage.getItem("auctions-seller");
//       if (storedAuctions) {
//         this.auctionn = JSON.parse(storedAuctions);
//       }
//     } catch (error) {
//       console.error("❌ ", error);
//     }
//   }

//   getAuctionStatus(auction: any): string {
//     return auction.status === 'Open' ? 'Open' : 'Closed';
//   }

//   getWinner(auction: any): string {
//     return auction.winner ? `${auction.winner} with a bid of $${auction.winnerAmount}` : 'No winner yet';
//   }
// }
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-dash-seller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dash-seller.component.html',
  styleUrls: ['./dash-seller.component.scss']
})
export class DashSellerComponent {
  private readonly _FormBuilder = inject(FormBuilder);
  auctionn: any[] = [];
  auctionForm!: FormGroup;
  isEditing = false;
  selectedAuctionId: number | null = null;
  isEndTimeDisabled = false;

  ngOnInit() {
    this.initForm();
    this.loadAuctionsFromStorage();
  }

  initForm() {
    this.auctionForm = this._FormBuilder.group({
      name: ["", Validators.required],
      category: ["", Validators.required],
      startingBid: [0, [Validators.required, Validators.min(1)]],
      imageUrl: ["", Validators.required],
      location: ["", Validators.required],
      endTime: ["", Validators.required],
      status: ["Open"],
      winner: [null],
      winnerAmount: [0],
    });
  }

  createAuction() {
    const selectedEndTime = new Date(this.auctionForm.value.endTime);
    const currentDateTime = new Date();

    if (selectedEndTime <= currentDateTime) {
      alert("End time must be in the future.");
      return;
    }

    if (this.auctionForm.valid) {
      const newAuction = {
        id: Date.now(),
        startTime: new Date().toISOString(),  
        ...this.auctionForm.value,
        endTime: new Date(this.auctionForm.value.endTime).toISOString(),
        currentBid: this.auctionForm.value.startingBid,
        bids: [],
      };

      this.auctionn.push(newAuction);
      this.saveToLocalStorage();
      this.auctionForm.reset();

      localStorage.setItem(`auctionStartTime_${newAuction.id}`, newAuction.startTime);
    } else {
      alert("Please fill all required fields correctly.");
    }
  }

  updateAuction() {
    const auctionStartTime = localStorage.getItem(`auctionStartTime_${this.selectedAuctionId}`);
    if (auctionStartTime && new Date(auctionStartTime).getTime() < Date.now()) {
      alert("You cannot modify the auction time after it has started.");
      return;
    }

    const selectedEndTime = new Date(this.auctionForm.value.endTime);
    const currentDateTime = new Date();

    if (selectedEndTime <= currentDateTime) {
      alert("End time must be in the future.");
      return;
    }

    const index = this.auctionn.findIndex(a => a.id === this.selectedAuctionId);
    if (index !== -1) {
      const originalAuction = this.auctionn[index];
      const formValue = this.auctionForm.value;

      // تحقق من التغيير في الحقول المسموح بها
      const hasChanges = formValue.name !== originalAuction.name ||
                        formValue.category !== originalAuction.category ||
                        formValue.imageUrl !== originalAuction.imageUrl ||
                        formValue.location !== originalAuction.location ||
                        formValue.startingBid !== originalAuction.startingBid;

      if (!hasChanges) {
        alert("No changes have been made to update.");
        return;
      }

      this.auctionn[index] = {
        ...this.auctionn[index],
        name: formValue.name,
        category: formValue.category,
        imageUrl: formValue.imageUrl,
        location: formValue.location,
        startingBid: formValue.startingBid,
      };

      this.saveToLocalStorage();
      this.isEditing = false;
      this.selectedAuctionId = null;
      this.isEndTimeDisabled = false;
      this.auctionForm.reset();

      alert("Auction updated successfully.");
    }
  }

  editAuction(auction: any) {
    const auctionStartTime = localStorage.getItem(`auctionStartTime_${auction.id}`);
    if (auctionStartTime && new Date(auctionStartTime).getTime() < Date.now()) {
      alert("You cannot modify the auction time after it has started.");
      return;
    }

    this.isEditing = true;
    this.selectedAuctionId = auction.id;

    const currentTime = new Date();
    const startTime = new Date(auction.startTime);
    const endTime = new Date(auction.endTime);

    this.isEndTimeDisabled = true; 
    const endTimeFormatted = endTime.toISOString().slice(0, 16);

    this.auctionForm.patchValue({
      ...auction,
      endTime: endTimeFormatted,
    });

    this.auctionForm.get('endTime')?.disable();
  }

  deleteAuction(id: number) {
    this.auctionn = this.auctionn.filter(a => a.id !== id);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem("auctions-seller", JSON.stringify(this.auctionn));
    } catch (error) {
      console.error("❌ ", error);
    }
  }

  private loadAuctionsFromStorage() {
    try {
      const storedAuctions = localStorage.getItem("auctions-seller");
      if (storedAuctions) {
        this.auctionn = JSON.parse(storedAuctions);
      }
    } catch (error) {
      console.error("❌ ", error);
    }
  }

  getAuctionStatus(auction: any): string {
    return auction.status === 'Open' ? 'Open' : 'Closed';
  }

  getWinner(auction: any): string {
    return auction.winner ? `${auction.winner} with a bid of $${auction.winnerAmount}` : 'No winner yet';
  }
}