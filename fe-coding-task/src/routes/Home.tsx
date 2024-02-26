import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { BarChart } from '@mui/x-charts/BarChart';
import Slider from '@mui/material/Slider';
import axios from 'axios';

const MIN_YEAR = 2009;
const MAX_YEAR = new Date().getFullYear()-1; // TODO: Looks like API returns error when quarter is in future, restrict selection to only previous quarters
const API_BASE_URL = "https://data.ssb.no/api/v0/no/table/07241";

type FormData = {
    houseType: string[],
    quarters: number[],
};

type TDataset = {
    data: number[],
    label: string,
    id: string
};

type BarChartData = {
    xAxis: string[];
    series: TDataset[];
};

function Home() {

    const [queryParameters, setQueryParameters] = useSearchParams();

    // Statistics data returned from API to populate bar chart
    const [chartData, setChartData] = useState<BarChartData>({
        xAxis: [],
        series: []
    });

    const onSubmit = async (data: FormData) => {
        if (data.quarters && data.houseType) {
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
                });
            } catch (error) {
                console.error('Error submitting form data:', error);
            }
        };
    };

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
    const [initialValues] = useState<FormData>({
        houseType: parsed.houseType ?? [],
        quarters: JSON.parse(saved).quarters ?? [MIN_QUARTER,MAX_QUARTER],
    });

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: initialValues
    });

    useEffect(() => {
        // TODO: perform error checking on url params, check if they are in possible range selections
        if (queryParameters.get("quarters")){
                setValue('quarters', queryParameters.get("quarters")?.split(',').map(Number) ?? initialValues.quarters);
        };
        if (queryParameters.get("houseType")){
            setValue('houseType', JSON.parse(queryParameters.get("houseType") ?? '') ?? initialValues.houseType);
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

    const createQuery = (quarters: String[], houseType: String[] ) => {
        const payload = {
            "query": [
                {
                    "code": "Boligtype",
                    "selection": {
                        "filter": "item",
                        "values": houseType
                    }
                },
                {
                    "code": "ContentsCode",
                    "selection": {
                    "filter": "item",
                        "values": [
                            "KvPris"
                        ]
                    }
                },
                {
                    "code": "Tid",
                    "selection": {
                        "filter": "item",
                        "values": quarters
                    }
                }
            ],
            "response": {
                "format": "json-stat2"
            }
        };
        return payload;
    };


    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Quarter Range:</label>
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
                            valueLabelDisplay="on"
                            getAriaValueText={quarterValue}
                            valueLabelFormat={quarterValue}
                        />
                    )}
                />
                <label>House Type:{errors.houseType && <div>This is required.</div>}</label>
                <select 
                    multiple
                    {...register("houseType", { required: true })}
                    placeholder="Select a house type">
                    <option value="00">Boliger i alt</option>
                    <option value="02"> Småhus</option>
                    <option value="03"> Blokkleiligheter</option>
                </select>
                <input type="submit" />
            </form>
            {chartData.xAxis.length > 0 &&
            <div>
                <h1>Average Price Per Square Meter</h1>
                <BarChart
                    xAxis={[{ scaleType: 'band', data: chartData.xAxis }]}
                    series={chartData.series}
                    width={500}
                    height={300}
                />
            </div>
            }
        </div>
    );
};

export default Home;