import { useSearchBox, UseSearchBoxProps } from "react-instantsearch";
import { Input } from "@/shared/ui/components/input/input";
import Icon from "@/shared/ui/components/icon/icon";

export default function SearchInput(props: UseSearchBoxProps) {
  const { query, refine } = useSearchBox(props);

  return (
    <Input
      value={query}
      onChange={(e) => refine(e.target.value)}
      size="rounded"
      leftIcon={
        <Icon
          icon="search"
          width={12}
          height={12}
          className="fill-text-secondary"
        />
      }
    />
  );
}
