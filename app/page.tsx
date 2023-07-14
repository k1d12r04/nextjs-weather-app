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
import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import Image from 'next/image';

interface ImageData {
  urls: {
    regular: string;
  };
}

const formSchema = z.object({
  city: z.string(),
});

export default function Home() {
  const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY;
  const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  const [city, setCity] = useState<null | string>();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const weatherDescription = weatherData?.weather[0]?.description;
  const [weatherIconUrl, setWeatherIconUrl] = useState<string | null>(null);
  const temperatureCelsius = weatherData?.main?.temp - 273.15;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}`
        );
        setWeatherData(response.data);
      } catch (error) {
        console.log('Error:', error);
      }
    };

    fetchWeatherData();
  }, [city, WEATHER_API_KEY]);

  useEffect(() => {
    setWeatherIconUrl(
      `https://openweathermap.org/img/wn/${weatherData?.weather[0]?.icon}@2x.png`
    );
  }, [weatherData]);

  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        const baseUrl = 'https://api.unsplash.com/search/photos';

        const params = {
          client_id: ACCESS_KEY,
          query: weatherDescription,
          orientation: 'landscape',
          per_page: '50',
        };

        const response: AxiosResponse<{ results: ImageData[] }> =
          await axios.get(baseUrl, { params });

        const results = response.data.results;
        if (results.length > 0) {
          const randomIndex = Math.floor(Math.random() * results.length);
          const randomImage = results[randomIndex];
          const imageUrl = randomImage.urls.regular;
          setImageUrl(imageUrl);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };

    fetchRandomImage();
  }, [ACCESS_KEY, weatherDescription]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setCity(values.city);
  }

  const capitalizeDescription = function (description: string) {
    const words = description.split(' ');
    const wordsUpper = [];

    for (const word of words) {
      wordsUpper.push(word[0].toUpperCase() + word.slice(1).toLowerCase());
    }
    return wordsUpper.join(' ');
  };

  console.log(weatherData);

  return (
    <div
      className="flex justify-center items-center w-full h-screen"
      style={{
        backgroundImage: ` ${weatherData && `url(${imageUrl})`} `,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
                      placeholder="Enter a city name"
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
              className="block mx-auto px-8 py-2 hover:bg-teal-900 transition"
              type="submit"
            >
              Show me weather
            </Button>
          </form>
        </Form>

        {weatherData && (
          <div className="mt-6 flex items-center justify-between">
            <div className="grid gap-2 justify-items-center">
              <img
                className="bg-black/10 rounded-md"
                src={weatherIconUrl}
                alt="weather icon"
              />
              <p className="font-medium text-lg">
                {temperatureCelsius.toFixed(1)}&deg;
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-xl"> {weatherData?.name} </h3>
              <p>
                {' '}
                {capitalizeDescription(
                  weatherData?.weather[0]?.description
                )}{' '}
              </p>
              <p>Humidity: {weatherData?.main?.humidity}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
