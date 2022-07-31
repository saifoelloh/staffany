import { Request, ResponseToolkit } from "@hapi/hapi";
import * as shiftUsecase from "../../../usecases/shiftUsecase";
import { errorHandler } from "../../../shared/functions/error";
import {
  ICreateShift,
  IPublishShift,
  ISuccessResponse,
  IUpdateShift,
} from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";
import { HttpError } from '../../../shared/classes/HttpError';
import moment from 'moment';
import { Between } from 'typeorm';

const logger = moduleLogger("shiftController");

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shifts");
  try {
    const filter = req.query;
    if (filter.where) {
      const start = moment(filter.where?.start).startOf("isoWeek").format("YYYY-MM-DD");
      const end = moment(filter.where?.end).endOf("isoWeek").format("YYYY-MM-DD");
      delete filter["where"];
      filter["where"] = {
        date: Between(start, end)
      }
    }
    const data = await shiftUsecase.find(filter);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const findById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.findById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info("Create shift");
  try {
    const body = req.payload as ICreateShift;
    const availableShift = await shiftUsecase.checkShiftAvailability(body);
    if (availableShift !== undefined) throw new HttpError(409, "overlapping shift");

    const payloadDate = moment(body.date);
    const start = moment(payloadDate).startOf("isoWeek").format("YYYY-MM-DD");
    const end = moment(payloadDate).endOf("isoWeek").format("YYYY-MM-DD");
    const shiftsOnWeek = await shiftUsecase.findShiftOnWeek(start, end);
    if (shiftsOnWeek.length > 0) throw new HttpError(409, "can't create shift on published week");

    const data = await shiftUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Create shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const updateById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Update shift by id");
  try {
    const id = req.params.id;
    const body = req.payload as IUpdateShift;

    const shift = await shiftUsecase.findById(id);
    if (shift === undefined) throw new HttpError(404, "shift not found");
    if (shift.isPublished) throw new HttpError(400, "you can't edit published shift");

    const data = await shiftUsecase.updateById(id, body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Update shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const deleteById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Delete shift by id");
  try {
    const id = req.params.id;
    const shift = await shiftUsecase.findById(id);
    if (shift === undefined) throw new HttpError(404, "shift not found");
    if (shift.isPublished) throw new HttpError(400, "you can't remove published shift");

    const data = await shiftUsecase.deleteById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Delete shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const publishShiftByWeek = async (req: Request, h: ResponseToolkit) => {
  logger.info("Publish shift by week");
  try {
    const payload = req.payload as IPublishShift;
    const shifts = await shiftUsecase.findShiftOnWeek(payload.start, payload.end, false);
    if (shifts.length === 0) throw new HttpError(404, "there's no shift in this week");

    const shiftIds = shifts.map((shift) => shift.id);
    const data = await shiftUsecase.publishShiftByIds(shiftIds);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Publish shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};