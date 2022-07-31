import * as shiftRepository from "../database/default/repository/shiftRepository";
import { Between, FindManyOptions, FindOneOptions } from "typeorm";
import Shift from "../database/default/entity/shift";
import { ICreateShift, IUpdateShift } from "../shared/interfaces";
import moment, { Moment } from 'moment';

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  return shiftRepository.findById(id, opts);
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;

  return shiftRepository.create(shift);
};

export const updateById = async (
  id: string,
  payload: IUpdateShift
): Promise<Shift> => {
  return shiftRepository.updateById(id, {
    ...payload,
  });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};

export const checkShiftAvailability = async (payload: Omit<ICreateShift, "name">) => {
  return shiftRepository.findOne(payload);
}

export const findShiftOnWeek = async (start: string, end: string, isPublished: boolean = true) => {
  console.log({ start, end });
  return shiftRepository.find({
    where: {
      date: Between(start, end),
      isPublished
    }
  });
}

export const publishShiftByIds = async (ids: string[]) => {
  return shiftRepository.updateBy(ids, { isPublished: true, publishedAt: new Date() });
}