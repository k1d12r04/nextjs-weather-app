'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

const formSchema = z.object({
  city: z.string(),
});

export default function Home() {
  const [city, setCity] = useState<null | string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setCity(values.city);
    console.log('clicked');
  }

  return (
    <div className="max-w-sm mx-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City Name</FormLabel>
                <FormControl>
                  <Input
                    className="text-orange-950 font-medium focus-visible:!ring-0  ring-offset-purple-600 shadow-inputShadow"
                    placeholder="enter a city name"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-white font-light">
                  Ones you provide a city name the current weather situation
                  will be shown.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="block mx-auto px-8 py-2 hover:bg-purple-900 transition"
            type="submit"
          >
            Show
          </Button>
        </form>
      </Form>
    </div>
  );
}
