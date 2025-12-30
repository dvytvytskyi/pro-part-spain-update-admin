"use client";
import React, { useMemo } from "react";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardDonutChart } from "../../components/dashboard/DashboardDonutChart";
import { DashboardBarChart } from "../../components/dashboard/DashboardBarChart";
import {
    GridIcon,
    BoxCubeIcon,
    UserCircleIcon,
    BoxIcon,
} from "../../icons";
import { amenitiesList } from "@/data/amenities";

export default function DashboardPage() {
    const [stats, setStats] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setStats(data);
                }
            })
            .catch(err => console.error("Failed to fetch dashboard stats:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div>
            <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
            </h1>

            {isLoading ? (
                <div className="flex h-100 items-center justify-center rounded-xl border border-gray-200 bg-white p-10 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                        <p className="text-gray-500">Loading dashboard data...</p>
                    </div>
                </div>
            ) : (
                <>

                    {/* Row 1: Stat Cards */}
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Properties"
                            value={stats.totalProperties}
                            icon={<GridIcon className="w-6 h-6" />}
                            color="bg-blue-600"
                        />
                        <StatCard
                            title="New Building Properties"
                            value={stats.offPlanProperties}
                            icon={<BoxCubeIcon className="w-6 h-6" />}
                            color="bg-emerald-500"
                        />
                        <StatCard
                            title="Developers"
                            value={stats.developers}
                            icon={<UserCircleIcon className="w-6 h-6" />}
                            color="bg-purple-600"
                        />
                        <StatCard
                            title="Facilities"
                            value={stats.facilities}
                            icon={<BoxIcon className="w-6 h-6" />}
                            color="bg-orange-500"
                        />
                    </div>

                    {/* Row 2: Price Stats */}
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-dark">
                            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Min Price
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {formatCurrency(stats.minPrice)}
                            </h4>
                        </div>
                        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-dark">
                            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Max Price
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {formatCurrency(stats.maxPrice)}
                            </h4>
                        </div>
                    </div>

                    {/* Row 3: Location Stats */}
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-dark">
                            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Countries
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {stats.countries}
                            </h4>
                        </div>
                        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-dark">
                            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Cities
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {stats.cities}
                            </h4>
                        </div>
                        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-dark">
                            <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Provinces
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {stats.areas}
                            </h4>
                        </div>
                    </div>

                    {/* Row 4: Charts (Type & City) */}
                    <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
                        <DashboardDonutChart
                            title="Properties by Type"
                            labels={stats.typeDistribution.labels}
                            series={stats.typeDistribution.series}
                            colors={["#3C50E0", "#10B981", "#F59E0B"]}
                        />
                        <DashboardBarChart
                            title="Top 5 Cities"
                            categories={stats.cityDistribution.categories}
                            series={[
                                {
                                    name: "Properties",
                                    data: stats.cityDistribution.data,
                                },
                            ]}
                        />
                    </div>

                    {/* Row 5: Charts (Bedrooms & Unit Types) */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <DashboardBarChart
                            title="Properties by Bedrooms"
                            categories={stats.bedDistribution.categories}
                            series={[
                                {
                                    name: "Properties",
                                    data: stats.bedDistribution.data,
                                },
                            ]}
                        />
                        <DashboardDonutChart
                            title="Top 5 Unit Types"
                            labels={stats.unitTypeDistribution.labels}
                            series={stats.unitTypeDistribution.series}
                            colors={["#3C50E0", "#10B981", "#8B5CF6", "#F59E0B", "#6366F1"]}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
