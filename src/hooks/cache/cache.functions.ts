import { TCachePlace, TCacheState } from './cache.types';

export const getPlace = (
  defaultPlace: TCachePlace,
  priorityPlace: TCachePlace | undefined,
  placements: TCacheState['placements'],
  key: string,
): TCachePlace => {
  return priorityPlace || placements?.[key]?.place || defaultPlace;
};
