import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUserInfo } from "@/store/shop/user-slice";
import Infomation from "@/components/shopping-view/infomation";

function ShoppingAccount() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);
  useEffect(() => {
    dispatch(fetchUserInfo());
  }, []);
  return (
    <div className="flex flex-col">

      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">

        {/* Avatar + tên */}
        

        {/* Tabs */}
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Infomation />
            </TabsContent>

            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>

            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;