"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

interface DashboardDonutChartProps {
    title: string;
    series: number[];
    labels: string[];
    colors?: string[];
}

export const DashboardDonutChart: React.FC<DashboardDonutChartProps> = ({
    title,
    series,
    labels,
    colors = ["#3C50E0", "#10B981", "#8B5CF6", "#F59E0B"], // Default colors
}) => {
    const options: ApexOptions = {
        chart: {
            type: "donut",
            fontFamily: "Satoshi, sans-serif",
        },
        colors: colors,
        labels: labels,
        legend: {
            show: true,
            position: "bottom",
            itemMargin: {
                horizontal: 10,
                vertical: 5
            },
            labels: {
                colors: ["#64748B"], // gray-500/slate-500 equivalent usually, but will adjust for theme
                useSeriesColors: false,
            },
            markers: {
                size: 5,
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: "Total",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#9CA3AF" // gray-400
                        },
                        value: {
                            show: true,
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "white", // Assuming dark mode primarily based on request
                            formatter: function (val: number | string) {
                                return val + "%";
                            }
                        }
                    }
                },
            },
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: "12px",
                colors: ["#fff"]
            }
        },
        tooltip: {
            theme: 'dark'
        },
        stroke: {
            show: false
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
            </div>
            <div className="-mx-4 flex justify-center">
                <ReactApexChart options={options} series={series} type="donut" height={350} />
            </div>
        </div>
    );
};
