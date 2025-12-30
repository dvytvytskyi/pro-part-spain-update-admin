"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

interface DashboardBarChartProps {
    title: string;
    categories: string[];
    series: { name: string; data: number[] }[];
    height?: number;
}

export const DashboardBarChart: React.FC<DashboardBarChartProps> = ({
    title,
    categories,
    series,
    height = 350,
}) => {
    const options: ApexOptions = {
        chart: {
            type: "bar",
            fontFamily: "Satoshi, sans-serif",
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "40%",
                borderRadius: 4,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 4,
            colors: ["transparent"],
        },
        xaxis: {
            categories: categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#9CA3AF", // gray-400
                    fontSize: "12px",
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#9CA3AF", // gray-400
                }
            }
        },
        legend: {
            show: false,
        },
        fill: {
            opacity: 1,
            colors: ["#3C50E0"], // Primary Blue
        },
        tooltip: {
            theme: "dark",
            y: {
                formatter: function (val: number) {
                    return val.toString();
                },
            },
        },
        grid: {
            show: true,
            borderColor: "#334155", // slate-700
            strokeDashArray: 0,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
            </div>
            <div>
                <ReactApexChart
                    options={options}
                    series={series}
                    type="bar"
                    height={height}
                />
            </div>
        </div>
    );
};
