import React from "react";
import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const MultisigProgress = ({ signedCount, threshold }) => (
  <Card className="mb-4">
    <CardContent className="pt-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-medium">AI Co-Signer</span>
        </div>

        <Badge variant="outline" className="text-xs">
          {signedCount}/{threshold} signatures
        </Badge>
      </div>

      <Progress value={(signedCount / threshold) * 100} className="mt-2 h-1" />
    </CardContent>
  </Card>
);

export default MultisigProgress;
