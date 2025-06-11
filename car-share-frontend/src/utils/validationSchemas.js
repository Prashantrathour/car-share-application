import * as Yup from 'yup';

export const driverRegistrationSchema = Yup.object().shape({
  vehicleModel: Yup.string()
    .required('Vehicle model is required'),
  licensePlate: Yup.string()
    .required('License plate is required'),
  seats: Yup.number()
    .required('Number of seats is required')
    .min(2, 'Minimum 2 seats required')
    .max(15, 'Maximum 15 seats allowed')
    .integer('Number of seats must be a whole number'),
  vehicleType: Yup.string()
    .required('Vehicle type is required')
    .oneOf(['sedan', 'suv', 'van', 'truck', 'luxury'], 'Invalid vehicle type'),
  driverLicense: Yup.object().shape({
    number: Yup.string()
      .required('Driver license number is required'),
    expiryDate: Yup.date()
      .required('License expiry date is required')
      .min(new Date(), 'License must not be expired'),
    state: Yup.string()
      .required('State is required'),
    country: Yup.string()
      .required('Country is required'),
    image: Yup.string()
      .required('Driver license image is required'),
  }),
  vehicleImages: Yup.array()
    .of(Yup.string())
    .nullable()
    .min(1, 'At least one vehicle image is required'),
}); 