import { filterOptions, filterNameMap } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ArrowUpNarrowWide } from "lucide-react";
import { useTranslation } from "react-i18next";


function ProductFilter({ filters, handleFilter }) {
    const { t } = useTranslation();

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className=" flex text-lg font-extrabold"><ArrowUpNarrowWide />{t(" Lọc sản phẩm")}</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem, index) => (
          <Fragment key={index}>
            <div>
              <h3 className="text-base font-bold">{t(`${filterNameMap[keyItem]}`)}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option, index) => (
                  <Label className="flex font-medium items-center gap-2 " key={index}>
                    <Checkbox
                      checked={
                        filters &&
                        filters[keyItem] &&
                        filters[keyItem].includes(option.id.toLowerCase())
                      }

                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {t(`${option.label}`)}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;