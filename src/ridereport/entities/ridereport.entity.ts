// entities/ridereport.entity.ts
export class RideReport {
  id: string;
  status: string;
  orderCode: string;
  driver: string;
  driver2: string;
  vehicle: string;
  vehicle2: string;
  pickupDate: Date;
  completionDate: Date;
  cancellationReason: string;
  address: string;
  serviceClass: string;
  mileageKm: string;
  fareInYangoPro: string;
  cash: string;
  card: string;
  corporatePayment: string;
  tip: string;
  promotion: string;
  bonuses: string;
  serviceFee: string;
  partnerFee: string;
  otherPayments: string;
  partnerRidePayments: string;
}
