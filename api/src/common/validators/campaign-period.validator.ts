import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'campaignPeriodOrder', async: false })
export class CampaignPeriodOrderConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any;
    
    const previewStart = obj.preview_start ? new Date(obj.preview_start) : null;
    const previewEnd = obj.preview_end ? new Date(obj.preview_end) : null;
    const launchStart = obj.launch_start ? new Date(obj.launch_start) : null;
    const launchEnd = obj.launch_end ? new Date(obj.launch_end) : null;
    const archiveStart = obj.archive_start ? new Date(obj.archive_start) : null;
    const archiveEnd = obj.archive_end ? new Date(obj.archive_end) : null;

    // Required order: preview_start < preview_end < launch_start < launch_end < archive_start < archive_end
    
    // Check pairs: start < end for each period
    if (previewStart && previewEnd && previewStart >= previewEnd) {
      return false;
    }
    if (launchStart && launchEnd && launchStart >= launchEnd) {
      return false;
    }
    if (archiveStart && archiveEnd && archiveStart >= archiveEnd) {
      return false;
    }

    // Check sequential order: preview_end < launch_start
    if (previewEnd && launchStart && previewEnd >= launchStart) {
      return false;
    }
    
    // Check sequential order: launch_end < archive_start
    if (launchEnd && archiveStart && launchEnd >= archiveStart) {
      return false;
    }
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Period dates must be in order: preview_start < preview_end < launch_start < launch_end < archive_start < archive_end';
  }
}

export function IsCampaignPeriodOrder(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCampaignPeriodOrder',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CampaignPeriodOrderConstraint,
    });
  };
}
