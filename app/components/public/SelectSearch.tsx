'use client';

import { useRouter, useSearchParams } from 'next/navigation';
type SelectOption = {
  value: string;
  label: string;
};

type SelectSearchProps = {
  name: string;
  options: SelectOption[];
};

export default function SelectSearch({name, options}: SelectSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <select
      id={`${name}Input`}
      name={name}
      defaultValue={searchParams.get(name) ?? ''}
      onChange={handleChange}
      className="form-select"
    >
      {options.map((item: any) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
