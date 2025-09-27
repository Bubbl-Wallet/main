"use client";

import { Loader2 } from "lucide-react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ContactForm = ({
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  onSubmit,
  onCancel,
  availableNetworks,
  isEdit = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Contact Name</Label>
        <Input
          id="name"
          placeholder="Enter contact name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        {formErrors.name && (
          <p className="text-sm text-destructive">{formErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Wallet Address</Label>
        <Input
          id="address"
          placeholder="0x..."
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          className="font-mono text-sm"
        />
        {formErrors.address && (
          <p className="text-sm text-destructive">{formErrors.address}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="network">Network</Label>
        <Select
          value={formData.network}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, network: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {availableNetworks.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center space-x-2">
                  <span>{network.icon}</span>
                  <span>{network.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {formErrors.network && (
          <p className="text-sm text-destructive">{formErrors.network}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>

        <Input
          id="note"
          placeholder="Add a note"
          value={formData.note}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, note: e.target.value }))
          }
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={onSubmit} disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Update Contact" : "Add Contact"}
        </Button>

        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ContactForm;
