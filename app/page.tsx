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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { motion, AnimatePresence } from 'framer-motion';

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
  const [weatherIconUrl, setWeatherIconUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const preferredLanguage =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('preferredLanguage')
        : '';
    return preferredLanguage || '';
  });

  const temperatureCelsius = weatherData?.main?.temp - 273.15;

  const formLabelText =
    (selectedLanguage === 'en' && 'City Name') ||
    (selectedLanguage === 'tr' && 'Şehir ismi');

  const formDescriptionText =
    (selectedLanguage === 'en' &&
      'Ones you provide a city name the instant weather situation will be shown.') ||
    (selectedLanguage === 'tr' &&
      'Herhangi bir şehir ismi girdiğinizde anlık hava durumu gösterilecek.');

  const submitButtonText =
    (selectedLanguage === 'en' && 'Show the weather') ||
    (selectedLanguage === 'tr' && 'Hava durumunu göster');

  const humidityText =
    (selectedLanguage === 'en' && 'Humidity') ||
    (selectedLanguage === 'tr' && 'Nem');

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', value);
    }
  };

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const preferredLanguage = localStorage.getItem('preferredLanguage');
      if (preferredLanguage) {
        setSelectedLanguage(preferredLanguage);
      }
    }
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&lang=${selectedLanguage}`
        );
        setWeatherData(response.data);
      } catch (error) {
        console.log('Error:', error);
      }
    };

    fetchWeatherData();
  }, [city, WEATHER_API_KEY, selectedLanguage]);

  useEffect(() => {
    setWeatherIconUrl(
      `https://openweathermap.org/img/wn/${weatherData?.weather[0]?.icon}@2x.png`
    );
  }, [weatherData]);

  useEffect(() => {
    const weatherDescription = weatherData?.weather[0]?.description;
    const fetchRandomImage = async () => {
      try {
        const baseUrl = 'https://api.unsplash.com/search/photos';

        const params = {
          client_id: ACCESS_KEY,
          query: weatherDescription,
          orientation: 'landscape',
          per_page: '30',
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
  }, [ACCESS_KEY, city, weatherData]);

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

  return (
    <div
      className="flex justify-center items-center w-full h-screen relative"
      style={{
        backgroundImage: ` ${weatherData && `url(${imageUrl})`} `,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundColor: `${!weatherData && 'rgba(0,0,0,0.1)'} `,
      }}
    >
      <motion.div
        key={weatherData?.id}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0, scale: 0.3 }}
        className="max-w-md mx-4 bg-black/50 rounded-md p-4"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> {formLabelText} </FormLabel>
                  <FormControl>
                    <Input
                      className="text-orange-950 font-medium focus-visible:!ring-0  ring-offset-teal-500 shadow-inputShadow"
                      placeholder={`${
                        (selectedLanguage === 'en' && 'Enter a city name') ||
                        (selectedLanguage === 'tr' && 'Bir şehir ismi girin')
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-white font-light">
                    {formDescriptionText}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="block mx-auto px-8 py-2 hover:bg-teal-900 transition"
              type="submit"
            >
              {submitButtonText}
            </Button>
          </form>
        </Form>

        <AnimatePresence>
          {weatherData && (
            <div className="mt-6 flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -200 }} // Set initial position
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: { duration: 1 },
                }}
                exit={{ opacity: 0, scale: 0.5, x: -200 }}
                className="grid gap-2 justify-items-center"
              >
                <img
                  className="bg-white/70 rounded-md"
                  src={weatherIconUrl || ''}
                  alt="weather icon"
                />
                <p className="font-medium text-lg">
                  {temperatureCelsius.toFixed(1)}&deg;
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 200 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: { duration: 1 },
                }}
                exit={{ opacity: 0, scale: 0.5, x: 200 }}
                className="space-y-2"
              >
                <h3 className="font-semibold text-xl"> {weatherData?.name} </h3>
                <p>
                  {' '}
                  {capitalizeDescription(
                    weatherData?.weather[0]?.description
                  )}{' '}
                </p>
                <p>
                  {humidityText}: {selectedLanguage === 'tr' && '%'}
                  {weatherData?.main?.humidity}
                  {selectedLanguage === 'en' && '%'}
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -300 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        className="absolute right-10 top-5 bg-black/50 rounded-md"
      >
        <Select onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[100px] focus:!ring-offset-0 focus:!ring-0">
            <SelectValue
              placeholder={`${
                (selectedLanguage === 'en' && 'English') ||
                (selectedLanguage === 'tr' && 'Türkçe')
              }`}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                className="cursor-pointer !text-black hover:!bg-black/80 hover:!text-white transition"
                value="tr"
              >
                Türkçe
              </SelectItem>
              <SelectItem
                className="cursor-pointer !text-black hover:!bg-black/80 hover:!text-white transition"
                value="en"
              >
                English
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </motion.div>
    </div>
  );
}
