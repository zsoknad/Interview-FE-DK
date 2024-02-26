import React, { useState, useEffect } from "react"
import axios from 'axios';
import { FormControl, InputLabel, MenuItem, Select, Button, TextField } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';

import { createQuery } from "./functions";

const MIN_YEAR = 2009;
const MAX_YEAR = new Date().getFullYear()-1; // TODO: Looks like API returns error when quarter is in future, restrict selection to only previous quarters
const API_BASE_URL = "https://data.ssb.no/api/v0/no/table/07241";

type TFormData = {
    houseType: string[],
    quarters: number[],
};

type TDataset = {
    data: number[],
    label: string,
    id: string
};

type TBarChartData = {
    xAxis: string[];
    series: TDataset[];
};

type TSavedStatistics = {
    comment: String,
    data: TBarChartData
}

const options = [
    {
      label: "Boliger i alt",
      value: "00",
    },
    {
      label: "Småhus",
      value: "02",
    },
    {
      label: "Blokkleiligheter",
      value: "03"
    }
  ];

function Home() {
    const generateSingleOptions = () => {
        return options.map((option: any) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        });
      };

    const [queryParameters, setQueryParameters] = useSearchParams();

    // Statistics data returned from API to populate bar chart
    const [chartData, setChartData] = useState<TBarChartData>({
        xAxis: [],
        series: []
    });

    const [comment, setComment] = useState<string>("");
    const onTextChange = (e: any) => setComment(e.target.value);

    const onSubmit = async (data: TFormData) => {
        if (data.quarters && data.houseType?.length) {
            localStorage.setItem("formData", JSON.stringify(data)); // save form data to local storage
            setQueryParameters({ houseType: JSON.stringify(data.houseType), quarters: `${data.quarters[0]},${data.quarters[1]}` }); // TODO: find a better way to do this
            try {
                const quarters = filterQuarters(data.quarters[0],data.quarters[1]);
                axios.post(`${API_BASE_URL}`, createQuery(quarters, data.houseType))
                .then((response) => {
                    setChartData({
                        xAxis: quarters,
                        series: formatResponseData(quarters, Object.values(response.data.dimension.Boligtype.category.label), response.data.value)
                    });
                    setComment("");
                });
            } catch (error) {
                console.error('Error submitting form data:', error);
            }
        };
    };

    // Simple mechanism to save a comment along with data if Bar Chart is populated
    const onSaveStatisticsSubmit = () => {
        const savedStatistics: TSavedStatistics = {
            comment: comment,
            data: chartData
        }
        setComment("");
        localStorage.setItem("savedStatistics", JSON.stringify(savedStatistics));
    };

    // Convert values returned from API into dataset to be consumed by Bar Chart
    const formatResponseData = (quarters: String[], houseLabels: string[], values: number[]) => {
        const numQuarters = quarters.length
        const chartValues: TDataset[] = [];

        houseLabels.forEach(label => {
            chartValues.push({
                data: values.splice(0, numQuarters),
                label: label,
                id: `${label}ID`
            });
        });
        return chartValues;
    };

    // Generate array of quarters for range selection; TODO; cap the selection at current quarter (need to know how quarter calendar)
    const generateQuarterRange = () => {
        const selections: { value: number, label: string }[] = [];
        let YEAR = MIN_YEAR;

        while (YEAR <= MAX_YEAR){
            for (let i = 1; i < 5; i++) {
                selections.push({ value: parseInt(`${YEAR}${i}`), label: ( i===1 ? `${YEAR}`: '' )}); // Don't show all quarter labels, only one at the start of a year
            };
            YEAR++;
        };
        return selections;
    };

    const QUARTERS = generateQuarterRange();
    const MIN_QUARTER = QUARTERS[0].value;
    const MAX_QUARTER = QUARTERS[QUARTERS.length-1].value;

    const saved = localStorage.getItem("formData") ?? '[]';
    const parsed = JSON.parse(saved);
    const [initialValues] = useState<TFormData>({
        houseType: parsed.houseType ?? [],
        quarters: JSON.parse(saved).quarters ?? [MIN_QUARTER,MAX_QUARTER],
    });

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<TFormData>({
        defaultValues: initialValues
    });

    useEffect(() => {
        // TODO: perform error checking on url params, check if they are in possible range selections
        if (queryParameters.get("quarters")){
                setValue('quarters', queryParameters.get("quarters")?.split(',').map(Number) ?? initialValues.quarters);
        };
        if (queryParameters.get("houseType")){
            setValue('houseType', JSON.parse(queryParameters.get("houseType") ?? '[]') ?? initialValues.houseType);
        }
      }, [queryParameters]);

    // Given a start and end quarter (from range selection) return an array of all quarters from start to end (inclusive)
    const filterQuarters = (quarterStart: number, quarterEnd: number) => {
        return QUARTERS.filter((quarter) => quarter.value >= quarterStart && quarter.value <= quarterEnd).map((item) => quarterValue(item.value));
    };

    // Formats quarter values as appropriate text
    const quarterValue = (quarter: number) => {
        return String(quarter).slice(0,4) + 'K' + String(quarter).slice(4);
    }

    return (
        <Box sx={{ pt:"10px", pb:"10px", width:"85%",  margin:"auto"}}>
            <h3>Select Quarters and House Type to View Average Price Per Square Meter in Norway</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid 
                    container 
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={4}
                >
                    <Grid item xs={10}>
                        <InputLabel id="quarter-range-label">Quarter Range:</InputLabel>
                        <Controller
                            name="quarters"
                            control={control}
                            render={({field}) => (
                                <Slider
                                    {...field}
                                    getAriaLabel={() => 'Quarter Range:'}
                                    min={MIN_QUARTER}
                                    max={MAX_QUARTER}
                                    marks={generateQuarterRange()}
                                    step={null}
                                    valueLabelDisplay="auto"
                                    getAriaValueText={quarterValue}
                                    valueLabelFormat={quarterValue}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl required error={!!errors.houseType} fullWidth>
                        <InputLabel id="select-house-type-label">House Type:</InputLabel>
                        <Controller
                            name="houseType"
                            control={control}
                            rules={{
                                required: true,
                              }}
                            render={({field}) => (
                                <Select
                                    required
                                    labelId="select-house-type-label"
                                    id="select-house-type"
                                    placeholder="House Type:"
                                    label="House Type:"
                                    {...field}
                                    fullWidth
                                    multiple>
                                    {generateSingleOptions()}
                                </Select>
                            )}
                        />
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </form>
            {chartData.xAxis.length > 0 && <>
                <h3>Average Price Per Square Meter</h3>
                <Grid 
                    container 
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={4}
                    >
                    <Grid item height={400} xs={6}>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: chartData.xAxis }]}
                            series={chartData.series}                            
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth
                                    multiline
                                    helperText="Enter a comment for this result"
                                    onChange={onTextChange}
                                    value={comment}
                                    >
                                    Enter a comment
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Button 
                                    fullWidth
                                    onClick={onSaveStatisticsSubmit}
                                    variant="contained"
                                    >
                                    Save Statistics
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </>
            }
        </Box>
    );
};

export default Home;