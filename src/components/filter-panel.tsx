'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import type { UseFormReturn } from 'react-hook-form';
import { CalendarIcon, Download, GitCompare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { State } from '@/app/actions';

const formSchema = z.object({
  state: z.string().min(1, 'Please select a state from the map.'),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  predictionDate: z.date({
    required_error: 'A prediction date is required.',
  }),
  model: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

interface FilterPanelProps {
  form: UseFormReturn<FormValues>;
  errors?: State['errors'];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Forecasting...
        </>
      ) : (
        'Get Forecast'
      )}
    </Button>
  );
}

export function FilterPanel({ form, errors }: FilterPanelProps) {
  return (
    <Form {...form}>
      <div className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="Select a state on the map" {...field} readOnly />
              </FormControl>
              <FormMessage>{errors?.state}</FormMessage>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" {...field} />
                </FormControl>
                <FormMessage>{errors?.lat}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="0.0001" {...field} />
                </FormControl>
                <FormMessage>{errors?.lon}</FormMessage>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="predictionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prediction Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage>{errors?.predictionDate}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forecasting Model</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Auto">Smart Select (Auto)</SelectItem>
                  <SelectItem value="ARIMA">ARIMA</SelectItem>
                  <SelectItem value="Prophet">Prophet</SelectItem>
                  <SelectItem value="LSTM">LSTM</SelectItem>
                  <SelectItem value="XGBoost">XGBoost</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage>{errors?.model}</FormMessage>
            </FormItem>
          )}
        />
        
        <SubmitButton />
        {errors?.server && <p className="text-sm font-medium text-destructive">{errors.server}</p>}

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Coming Soon</h3>
          <Button variant="outline" className="w-full justify-start" disabled>
            <GitCompare className="mr-2 h-4 w-4" /> Compare Models
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <Download className="mr-2 h-4 w-4" /> Download CSV of Forecast
          </Button>
        </div>
      </div>
    </Form>
  );
}
