import { default as vehiclesReducer } from './vehiclesSlice';
import { fetchVehicles } from './vehiclesThunks';
import {
  setSelectedVehicle,
  setError,
  selectVehicles,
  selectSelectedVehicle,
  selectVehiclesLoading,
  selectVehiclesError
} from './vehiclesSlice';

export {
  vehiclesReducer as default,
  // Thunks
  fetchVehicles,
  // Actions
  setSelectedVehicle,
  setError,
  // Selectors
  selectVehicles,
  selectSelectedVehicle,
  selectVehiclesLoading,
  selectVehiclesError
}; 