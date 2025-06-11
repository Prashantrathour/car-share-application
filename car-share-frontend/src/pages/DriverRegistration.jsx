import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { 
  selectDriverProfile, 
  selectDriverLoading, 
  selectDriverError,
  fetchDriverDetails,
  becomeDriver
} from '../features/driver';

const currentYear = new Date().getFullYear();

const vehicleRegistrationSchema = Yup.object().shape({
  make: Yup.string().required('Make is required'),
  model: Yup.string().required('Model is required'),
  year: Yup.number()
    .required('Year is required')
    .min(1900, 'Year must be 1900 or later')
    .max(currentYear + 1, `Year must not be later than ${currentYear + 1}`),
  licensePlate: Yup.string().required('License plate is required'),
  color: Yup.string().required('Color is required'),
  type: Yup.string()
    .oneOf(['sedan', 'suv', 'van', 'truck', 'luxury'], 'Invalid vehicle type')
    .required('Vehicle type is required'),
  seats: Yup.number()
    .required('Number of seats is required')
    .min(2, 'Minimum 2 seats required')
    .max(15, 'Maximum 15 seats allowed'),
  transmission: Yup.string()
    .oneOf(['automatic', 'manual'], 'Invalid transmission type')
    .required('Transmission type is required'),
  features: Yup.array().of(Yup.string()),
  dailyRate: Yup.number()
    .required('Daily rate is required')
    .min(0, 'Daily rate must be positive'),
  location: Yup.object().shape({
    latitude: Yup.number().required('Latitude is required'),
    longitude: Yup.number().required('Longitude is required'),
    address: Yup.string().required('Address is required'),
  }),
  images: Yup.array().of(Yup.string()),
  documents: Yup.object().shape({
    insurance: Yup.string().required('Insurance document is required'),
    registration: Yup.string().required('Registration document is required'),
  }),
});

const DriverRegistration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector(state => state.auth.user);
  const driverProfile = useSelector(selectDriverProfile);
  const isDriverLoading = useSelector(selectDriverLoading);
  const driverError = useSelector(selectDriverError);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      if (user?.role === 'driver') {
        try {
          // If we already have the driver profile in Redux state, use it
          if (driverProfile) {
            setDriverDetails(driverProfile);
            setIsLoading(false);
          } else {
            // Otherwise dispatch the thunk to fetch it
            await dispatch(fetchDriverDetails(user.id));
          }
        } catch (error) {
          console.error('Error fetching driver details:', error);
          toast.error('Failed to fetch driver details');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchDriverDetails();

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get your location. Please enter it manually.');
        }
      );
    }
  }, [user, navigate, dispatch, driverProfile]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (driverProfile) {
      setDriverDetails(driverProfile);
      setIsLoading(false);
    }
  }, [driverProfile]);

  // Show error toast when driver error occurs
  useEffect(() => {
    if (driverError) {
      toast.error(driverError);
      setIsLoading(false);
    }
  }, [driverError]);

  const initialValues = {
    make: '',
    model: '',
    year: currentYear,
    licensePlate: '',
    color: '',
    type: '',
    seats: 4,
    transmission: 'automatic',
    features: [],
    dailyRate: '',
    location: {
      latitude: '',
      longitude: '',
      address: '',
    },
    images: [],
    documents: {
      insurance: '',
      registration: '',
    },
  };

  const handleFileChange = (event, setFieldValue, field) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFileChange = (event, setFieldValue) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const promises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(images => {
        setFieldValue('images', ['https://th.bing.com/th/id/OIP.XhylxYlqcEB8ojH_yLxyvgHaEK?rs=1&pid=ImgDetMain', 'https://th.bing.com/th/id/OIP.XhylxYlqcEB8ojH_yLxyvgHaEK?rs=1&pid=ImgDetMain']);
      });
    }
  };

  const availableFeatures = [
    'Air Conditioning',
    'Bluetooth',
    'Backup Camera',
    'USB Charging',
    'Navigation',
    'Sunroof',
    'Heated Seats',
    'Premium Sound System',
    'Apple CarPlay',
    'Android Auto',
  ];

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitError(null);
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!values.make || !values.model || !values.licensePlate) {
        const error = new Error('Please fill in all required fields');
        setSubmitError(error.message);
        throw error;
      }
      
      // Check if documents are provided
      if (!values.documents?.insurance || !values.documents?.registration) {
        const error = new Error('Please upload both insurance and registration documents');
        setSubmitError(error.message);
        throw error;
      }
      
      // Ensure location data is properly formatted
      const locationData = {
        latitude: currentLocation?.latitude || parseFloat(values.location.latitude) || 0,
        longitude: currentLocation?.longitude || parseFloat(values.location.longitude) || 0,
        address: values.location.address || ''
      };

      // Transform the values to match the expected format
      const formData = {
        make: values.make,
        model: values.model,
        year: parseInt(values.year) || currentYear,
        licensePlate: values.licensePlate,
        color: values.color,
        type: values.type,
        seats: parseInt(values.seats) || 4,
        transmission: values.transmission,
        features: Array.isArray(values.features) ? values.features : [],
        dailyRate: parseFloat(values.dailyRate) || 0,
        location: locationData,
        images: Array.isArray(values.images) ? values.images : [],
        documents: {
          insurance:  'https://www.google.com',
          registration: 'https://www.google.com'
          // insurance: values.documents?.insurance || '',
          // registration: values.documents?.registration || ''
        },
        ownerId: user?.id // Add owner ID from user state
      };

      // Log the data being submitted
      console.log('Submitting form data:', formData);

      // Dispatch the Redux action instead of calling the service directly
      const resultAction = await dispatch(becomeDriver(formData));
      
      if (becomeDriver.fulfilled.match(resultAction)) {
        // Show success message and redirect
        toast.success('Vehicle registration submitted successfully!');
        // resetForm();
        // navigate('/dashboard');
      } else {
        const errorMessage = resultAction.payload || 'Failed to register vehicle. Please try again.';
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to register vehicle. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user?.role === 'driver' && driverDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Your Vehicle Details</h1>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Make</p>
                    <p className="font-medium">{driverDetails.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium">{driverDetails.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{driverDetails.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{driverDetails.color}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Vehicle Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">License Plate</p>
                    <p className="font-medium">{driverDetails.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium capitalize">{driverDetails.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-medium capitalize">{driverDetails.transmission}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Seats</p>
                    <p className="font-medium">{driverDetails.seats}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {driverDetails.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Pricing</h2>
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="font-medium text-2xl text-indigo-600">${driverDetails.dailyRate}</p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Location</h2>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{driverDetails.location?.address}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Latitude</p>
                      <p className="font-medium">{driverDetails.location?.latitude}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Longitude</p>
                      <p className="font-medium">{driverDetails.location?.longitude}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Insurance Document</p>
                    <a 
                      href={driverDetails.documents?.insurance} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View Insurance Document
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Document</p>
                    <a 
                      href={driverDetails.documents?.registration} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View Registration Document
                    </a>
                  </div>
                </div>
              </div>

              {/* Vehicle Images */}
              {driverDetails.images?.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Vehicle Images</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {driverDetails.images.map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                        <img
                          src={image}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Register Your Vehicle</h1>
          
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">Error: {submitError}</p>
              <p>Please correct the errors and try again.</p>
            </div>
          )}
          
          <Formik
            initialValues={initialValues}
            // validationSchema={vehicleRegistrationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Vehicle Information */}
                  <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                        <Field
                          name="make"
                          type="text"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                          placeholder="e.g., Toyota"
                        />
                        {errors.make && touched.make && (
                          <div className="text-red-500 text-sm mt-1">{errors.make}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <Field
                          name="model"
                          type="text"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                          placeholder="e.g., Camry"
                        />
                        {errors.model && touched.model && (
                          <div className="text-red-500 text-sm mt-1">{errors.model}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <Field
                          name="year"
                          type="number"
                          min="1900"
                          max={currentYear + 1}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        />
                        {errors.year && touched.year && (
                          <div className="text-red-500 text-sm mt-1">{errors.year}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <Field
                          name="color"
                          type="text"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                          placeholder="e.g., Silver"
                        />
                        {errors.color && touched.color && (
                          <div className="text-red-500 text-sm mt-1">{errors.color}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Vehicle Details</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                        <Field
                          name="licensePlate"
                          type="text"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                          placeholder="e.g., ABC123"
                        />
                        {errors.licensePlate && touched.licensePlate && (
                          <div className="text-red-500 text-sm mt-1">{errors.licensePlate}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <Field
                          as="select"
                          name="type"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        >
                          <option value="">Select a vehicle type</option>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="van">Van</option>
                          <option value="truck">Truck</option>
                          <option value="luxury">Luxury</option>
                        </Field>
                        {errors.type && touched.type && (
                          <div className="text-red-500 text-sm mt-1">{errors.type}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                        <Field
                          as="select"
                          name="transmission"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        >
                          <option value="automatic">Automatic</option>
                          <option value="manual">Manual</option>
                        </Field>
                        {errors.transmission && touched.transmission && (
                          <div className="text-red-500 text-sm mt-1">{errors.transmission}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
                        <Field
                          name="seats"
                          type="number"
                          min="2"
                          max="15"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        />
                        {errors.seats && touched.seats && (
                          <div className="text-red-500 text-sm mt-1">{errors.seats}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                        <Field
                          type="checkbox"
                          name="features"
                          value={feature}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">{feature}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Pricing</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate ($)</label>
                    <Field
                      name="dailyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                      placeholder="0.00"
                    />
                    {errors.dailyRate && touched.dailyRate && (
                      <div className="text-red-500 text-sm mt-1">{errors.dailyRate}</div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <Field
                        name="location.address"
                        type="text"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        placeholder="Enter your address"
                      />
                      {errors.location?.address && touched.location?.address && (
                        <div className="text-red-500 text-sm mt-1">{errors.location.address}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <Field
                          name="location.latitude"
                          type="number"
                          step="any"
                          value={currentLocation?.latitude || values.location.latitude}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <Field
                          name="location.longitude"
                          type="number"
                          step="any"
                          value={currentLocation?.longitude || values.location.longitude}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Documents</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Document</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setFieldValue, 'documents.insurance')}
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                          cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Document</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, setFieldValue, 'documents.registration')}
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                          cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Images */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Vehicle Images</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Multiple Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMultipleFileChange(e, setFieldValue)}
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                        cursor-pointer"
                    />
                  </div>
                  {values.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {values.images.map((image, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                          <img
                            src={image}
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Registering Vehicle...</span>
                    </span>
                  ) : (
                    'Register Vehicle'
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration; 