import React from "react";

const features = [
  "Employee Timeline View",
  "Leave Request Management",
  "Multi-level Approvals",
  "HR Analytics Dashboard",
];

const employees = [
  {
    name: "Ram",
    id: "HR-2847",
    leaves: [4, 9, 10, 11],
    type: "vacation",
  },
  {
    name: "Shyam",
    id: "HR-1593",
    leaves: [],
    type: "",
  },
  {
    name: "Sita",
    id: "HR-3062",
    leaves: [2, 3],
    type: "sick",
  },
  {
    name: "Gita",
    id: "HR-4215",
    leaves: [8, 9],
    type: "overtime",
  },
];

const summary = [
  {
    label: "Total Employees",
    value: "15",
    icon: "♙",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Pending Requests",
    value: "3",
    icon: "▣",
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "On Leave Today",
    value: "5",
    icon: "▦",
    color: "bg-green-50 text-green-700",
  },
  {
    label: "Attendance Rate",
    value: "92%",
    icon: "▥",
    color: "bg-teal-50 text-teal-700",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">

      <nav className="border-b border-slate-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">

          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-lg text-white shadow-md shadow-emerald-200">
              ▦
            </div>
            <span className="text-lg font-bold tracking-tight">
              LeaveFlow
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-emerald-600">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-emerald-600">
              Pricing
            </a>
            <a href="#about" className="transition hover:text-emerald-600">
              About
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium sm:flex">
              ◎ <span>English</span>
            </button>

            <a
              href="/login"
              className="hidden text-sm font-medium text-slate-700 hover:text-emerald-600 sm:block"
            >
              Login
            </a>

            <a
              href="/login"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <section className="relative bg-linear-to-b from-emerald-50/80 via-white to-white px-5 pt-12 pb-20">

        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#d1fae5 1px, transparent 1px), linear-gradient(90deg, #d1fae5 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-100/70 px-4 py-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            HR Management System
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Leave Management
            <br />
            <span className="bg-linear-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
              & Work Schedules
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Complete system for managing employee leaves, work schedules,
            and approvals. Interactive timeline view for all employees
            with advanced reports and analytics.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="/login"
              className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Get Started <span className="ml-2">→</span>
            </a>

            <a
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Login
            </a>
          </div>

          <div
            id="features"
            className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
          >
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[10px] font-bold text-emerald-600">
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-emerald-100/70">

          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <span className="ml-3 text-xs text-slate-500">
              Employee Timeline View
            </span>
          </div>

          <div className="p-4 sm:p-6">

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                  ▦
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-800">
                    December 2026
                  </h3>
                  <p className="text-xs text-slate-500">
                    15 Active Employees
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
                  ● Vacation
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-600">
                  ● Sick
                </span>
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-teal-700">
                  ● Overtime
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="grid grid-cols-[105px_minmax(0,1fr)] items-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {employee.name}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {employee.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-14">
                    {Array.from({ length: 14 }, (_, index) => {
                      const isLeave = employee.leaves.includes(index);
                      const color =
                        isLeave && employee.type === "sick"
                          ? "bg-red-400"
                          : isLeave && employee.type === "overtime"
                            ? "bg-teal-500"
                            : isLeave
                              ? "bg-emerald-500"
                              : "bg-slate-100";

                      return (
                        <div
                          key={index}
                          className={`flex h-6 items-center justify-center rounded-md ${color}`}
                        >
                          {isLeave ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 lg:grid-cols-4">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl p-4 text-center ${item.color}`}
                >
                  <div className="mb-1 text-lg">{item.icon}</div>
                  <h3 className="text-2xl font-bold">{item.value}</h3>
                  <p className="mt-1 text-[10px] font-medium opacity-80">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Simple. Efficient. Transparent.
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">
          Everything your team needs
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          From submitting leave requests to managing approvals, LeaveFlow
          keeps your entire leave management process organized in one place.
        </p>
      </section>

      <footer className="border-t border-slate-100 px-5 py-6 text-center text-xs text-slate-500">
        © 2026 LeaveFlow. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
