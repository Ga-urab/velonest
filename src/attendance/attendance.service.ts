// attendance.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Request } from 'express';

// Haversine formula to calculate distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
}

// Example: allowed office location
const OFFICE_LOCATION = { lat: 27.718683, lng: 85.309144 };
const MAX_DISTANCE_METERS = 100;

@Injectable()
export class AttendanceService {
  constructor(@InjectModel('Attendance') private attendanceModel: Model<any>) {}

  async markAttendance(dto: CreateAttendanceDto, req: Request) {
    const distance = getDistance(
      dto.latitude,
      dto.longitude,
      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng,
    );

    // Office network IPs (replace with your office public IPs)
    const officeIps = ['124.41.198.100'];

    let clientIp =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    if (clientIp?.includes(',')) {
      clientIp = clientIp.split(',')[0].trim(); // first IP if multiple
    }
    clientIp = clientIp?.replace('::ffff:', ''); // clean IPv4-mapped

    const insideLocation = distance <= MAX_DISTANCE_METERS;
    const insideNetwork = officeIps.includes(clientIp || '');

    // ✅ Allow if either condition is true
    if (!insideLocation && !insideNetwork) {
      throw new BadRequestException('You are not at the allowed location or network');
    }

    // Define start & end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check today's attendance for this user
    const todayAttendance = await this.attendanceModel.findOne({
      name: dto.name,
      checkIn: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!todayAttendance) {
      // First punch → check-in
      const attendance = new this.attendanceModel({
        name: dto.name,
        checkIn: new Date(),
        location: { type: 'Point', coordinates: [dto.longitude, dto.latitude] },
      });
      return attendance.save();
    }

    if (!todayAttendance.checkOut) {
      // Second punch → check-out
      todayAttendance.checkOut = new Date();
      return todayAttendance.save();
    }

    throw new BadRequestException('Already checked in and out for today');
  }

  async getAllAttendance() {
    return this.attendanceModel.find().sort({ timestamp: -1 }).exec();
  }

  async getAttendanceByDate(date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({ timestamp: { $gte: start, $lte: end } })
      .sort({ timestamp: 1 })
      .exec();
  }
}
