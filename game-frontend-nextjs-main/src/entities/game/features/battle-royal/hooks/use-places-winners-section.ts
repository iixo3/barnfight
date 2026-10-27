import { formatPlacesString } from "@/shared/utils/format-places-string";

interface UsePlacesWinnersSectionParams {
  places: Array<number>;
}

type UsePlacesWinnersReturn = string;

export const usePlacesWinnersSection = ({
  places,
}: UsePlacesWinnersSectionParams): UsePlacesWinnersReturn => {
  if (!places || !places?.length) return "";

  const getOrdinal = (place: number) => {
    return formatPlacesString(place);
  };

  const getView = places.sort().map(getOrdinal).join(", ");

  return getView;
};
