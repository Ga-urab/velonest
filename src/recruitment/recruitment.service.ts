// recruitment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScoutDto } from './dto/create-scout.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import * as QRCode from 'qrcode';
import { SelfRegisterDriverDto } from './dto/self-register-driver.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel('Scout') private scoutModel: Model<any>,
    @InjectModel('Workshop') private workshopModel: Model<any>,
    @InjectModel('Driver') private driverModel: Model<any>,
  ) {}

  async addScout(dto: CreateScoutDto) {
    const scout = new this.scoutModel(dto);
    return scout.save();
  }

  async addWorkshop(dto: CreateWorkshopDto) {
  const scout = await this.scoutModel.findOne({ scoutId: dto.scoutId });
  if (!scout) throw new NotFoundException('Scout not found');

  // Create workshop
  const workshop = new this.workshopModel({
    workshopId: dto.workshopId,
    scout: scout._id,
    name: dto.name,
    location: dto.location,
  });
  await workshop.save();

  // Generate QR linking to driver registration form
  const registrationUrl = `https://yourdomain.com/register-driver?workshopId=${workshop.workshopId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(registrationUrl);

  workshop.qrCodeUrl = qrCodeDataUrl;
  await workshop.save();

  scout.workshops.push(workshop._id);
  await scout.save();

  return workshop;
}

  async addDriver(dto: CreateDriverDto) {
    const workshop = await this.workshopModel.findOne({ workshopId: dto.workshopId });
    if (!workshop) throw new NotFoundException('Workshop not found');

    const driver = new this.driverModel({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      workshop: workshop._id,
      vehicle: dto.vehicle,
    });
    await driver.save();

    workshop.drivers.push(driver._id);
    await workshop.save();

    return driver;
  }

  // Extra: fetch all drivers for a scout
  async getDriversByScout(scoutId: string) {
    const scout = await this.scoutModel.findOne({ scoutId }).populate({
      path: 'workshops',
      populate: { path: 'drivers' },
    });
    if (!scout) throw new NotFoundException('Scout not found');
    return scout.workshops.flatMap((w: any) => w.drivers);
  }

  async selfRegisterDriver(dto: SelfRegisterDriverDto) {
  const workshop = await this.workshopModel.findOne({ workshopId: dto.workshopId });
  if (!workshop) throw new NotFoundException('Workshop not found');

  const driver = new this.driverModel({
    fullName: dto.fullName,
    phoneNumber: dto.phoneNumber,
    workshop: workshop._id,
    vehicle: dto.vehicle,
  });
  await driver.save();

  workshop.drivers.push(driver._id);
  await workshop.save();

  return driver;
}
// recruitment.service.ts
async getWorkshopById(workshopId: string) {
  const workshop = await this.workshopModel.findOne({ workshopId });
  if (!workshop) throw new NotFoundException('Workshop not found');
  return workshop;
}

// --- READ ---
async getAllScouts() {
  return this.scoutModel.find().populate('workshops').exec();
}

async getAllDrivers() {
  return this.driverModel.find().populate('workshop').exec();
}

async getAllWorkshops() {
  return this.workshopModel.find().populate('scout').populate('drivers').exec();
}

async getScoutById(scoutId: string) {
  const scout = await this.scoutModel.findOne({ scoutId }).populate('workshops');
  if (!scout) throw new NotFoundException('Scout not found');
  return scout;
}

async getDriverById(driverId: string) {
  const driver = await this.driverModel.findOne({ driverId }).populate('workshop');
  if (!driver) throw new NotFoundException('Driver not found');
  return driver;
}

// getWorkshopById already exists

// --- UPDATE ---
async updateScout(scoutId: string, update: Partial<CreateScoutDto>) {
  const scout = await this.scoutModel.findOneAndUpdate({ scoutId }, update, { new: true });
  if (!scout) throw new NotFoundException('Scout not found');
  return scout;
}

async updateDriver(driverId: string, update: Partial<CreateDriverDto>) {
  const driver = await this.driverModel.findOneAndUpdate({ driverId }, update, { new: true });
  if (!driver) throw new NotFoundException('Driver not found');
  return driver;
}

async updateWorkshop(workshopId: string, update: Partial<CreateWorkshopDto>) {
  const workshop = await this.workshopModel.findOneAndUpdate({ workshopId }, update, { new: true });
  if (!workshop) throw new NotFoundException('Workshop not found');
  return workshop;
}

// --- DELETE ---
async deleteScout(scoutId: string) {
  const result = await this.scoutModel.findOneAndDelete({ scoutId });
  if (!result) throw new NotFoundException('Scout not found');
  return { message: 'Scout deleted successfully' };
}

async deleteDriver(driverId: string) {
  const result = await this.driverModel.findOneAndDelete({ driverId });
  if (!result) throw new NotFoundException('Driver not found');
  return { message: 'Driver deleted successfully' };
}

async deleteWorkshop(workshopId: string) {
  const result = await this.workshopModel.findOneAndDelete({ workshopId });
  if (!result) throw new NotFoundException('Workshop not found');
  return { message: 'Workshop deleted successfully' };
}

}
