import {
  Tab,
  Tabs as MuiTabs,
  type SxProps,
  type TabProps as MuiTabProps,
  type TabsProps as MuiTabsProps,
  type Theme,
} from "@mui/material";
import type { SyntheticEvent } from "react";

export interface TabsItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps extends Omit<MuiTabsProps, "value" | "onChange"> {
  items: TabsItem[];
  value: string;
  onChange: (value: string) => void;
  tabsSx?: SxProps<Theme>;
  tabSx?: MuiTabProps["sx"];
}

export const Tabs = ({
  items,
  value,
  onChange,
  tabsSx,
  tabSx,
  variant = "standard",
  ...props
}: TabsProps) => {
  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <MuiTabs
      value={value}
      onChange={handleChange}
      variant={variant}
      sx={[
        {
          minHeight: 40,
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: 999,
          },
        },
        ...(Array.isArray(tabsSx) ? tabsSx : tabsSx ? [tabsSx] : []),
      ]}
      {...props}
    >
      {items.map((item) => (
        <Tab
          key={item.value}
          value={item.value}
          label={item.label}
          disabled={item.disabled}
          sx={[
            {
              textTransform: "none",
              minHeight: 40,
              py: 0.75,
              px: 1.5,
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "text.primary",
              },
            },
            ...(Array.isArray(tabSx) ? tabSx : tabSx ? [tabSx] : []),
          ]}
        />
      ))}
    </MuiTabs>
  );
};
