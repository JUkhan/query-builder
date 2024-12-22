import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConstantService {
  permittedAction$ = new BehaviorSubject<string[]>([]);
  static OperationType = {
    INSERT: 'insert',
    UPDATE: 'update',
    DELETE: 'delete',
    GET: 'get',
    GETALL: 'getall',
    FILTEREDGETALL: 'GetAllWithFilter',
  };

  static ApiType = {
    CRUD: 'crud',
    CONFIG: 'config',
    DYNAMIC_CONFIG: 'DynamicConfig',
  };

  static DateFormat = {
    DATEFORMAT_DD_MM_YYYY: 'DD/MM/YYYY',
    DATETIMEFORMAT_DD_MM_YYYY: 'DD/MM/YYYY HH:mm:ss',
    DATETIMEFORMAT_DD_MM_YYYY_AM: 'DD/MM/YYYY hh:mm:ss A',
    DATETIMEFORMAT_YYYY_MM_DD_FullTime: 'YYYY-MM-DDTHH:mm:ss',
    YEAR_ONLY: 2,
    MONTH_ONLY: 1,
    FULL_DATE: 0,
  };

  static Message = {
    SUCCESSFUL_TITLE: 'Success',
    SAVED_SUCCESSFUL: 'Saved Successfully',
    DELETE_SUCCESSFUL: 'Deleted Successfully',
    DELETE_TITLE: 'Delete',
    CANCEL_SUCCESSFUL: 'Canceled Successfully',
    DELETE_SUCCESSFUL_TITLE: 'Confirm Delete',
    DELETE_SUCCESSFUL_MESSAGE: 'Are you sure you want to delete?',
    SAVED_FAIL_TITLE: 'Error',
    SAVED_FAIL: 'The Operation is failed',
    NO_ADMIN_MENU: 'You do not have any permission',
    AUTH_ERROR: 'Wrong username or password',
    CANCEL_WARNING:
      'Are you sure you want to cancel? All your entered data will be lost.',
    DELETE_CONFIRMATION_MESSAGE: 'Are you sure you want to delete?',
    CONFIRM_CANCEL: 'Are you sure you want to cancel?',
    DATA_ELEMENT_DUPLICATE_WARNING:
      'Data element value or name can not be duplicate',
    DATA_ELEMENT_EMPTY_WARNING: 'Data element value or name can not be empty',
    MENTOR_REMOVE_SUCCESS_MESSAGE: 'Mentor(s) Removed Successfully',
    INCOMPLETE_TASK_TITLE: 'Incomplete Task',
    INCOMPLETE_TASK_WARNING_MESSAGE:
      'You have an incomplete task. Do you really want to leave?',
    MAX_MIN_VALIDATION_WARNING:
      'Max value should be equal or greater than Min value',
    SURVEY_FORM_PUBLISH_WITH_NO_QUESTION_WARNING:
      'Survey form should have at least one question to publish.',
    NOT_PROVIDE_ATTRIBUTE_WARNING:
      'You might not provide attribute for a question',
    NOT_PROVIDE_ATTRIBUTE_TO_ALL_QUESTIONS: `You didn't provide attribute to all the questions`,
    CLONE_SUCCESSFUL: 'Cloned Successfully',
    FORM_PUBLISH_SUCCESSFUL: 'Form Published Successfully',
    SURVEY_DATA_UPLOAD_STARTED: 'Excel data is being uploaded',
    SELECT_A_FILE: 'Please select a file',
  };

  static Gender = {
    MALE: 'Male',
    FEMALE: 'Female',
  };

  static SurveyImageDownloadEndpoint = {
    IMAGE_LOCATION: 'Upload/Media/',
  };
  static LINKED_ITEM_TYPE = {
    HOUSE_HOLD: 'HOUSE_HOLD',
    HOUSE_HOLD_MEMBER: 'HOUSE_HOLD_MEMBER',
    TRAINER: 'TRAINER',
    SERVICE_POINT: 'SERVICE_POINT',
    STAKEHOLDER: 'STAKEHOLDER',
  };

  static FileLocations = {
    IMAGE_PATH: 'Upload/Media/',
  };
  static readonly OPTIONS_TYPE_QUESTIONS: string[] = [
    'radio',
    'checkbox',
    'dropdown',
  ];
  static readonly Endpoints = {
    SAVE_DRAFT_SURVEY_FORM: 'DraftSurveyForm/SaveDraftSurveyFormQuestions',
  };
  static FormLoaderTitle = {
    ADD_DATA: 'Add Data',
    EDIT_DATA: 'Edit Data',
  };
}

export enum LinkedItemTypeName {
  SURVEY_QUESTION = 'Survey Question',
  GROUP = 'Group',
  STAFF = 'Staff',
  OFFICE = 'Office',
}
