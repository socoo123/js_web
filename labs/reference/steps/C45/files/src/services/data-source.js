// region data-source
import { createApiRepository } from "./api-repository.js";
import { repository as mockRepository } from "./inventory-repository.js";
// 构建时由 Vite 写入：api 连本地后端（默认），mock 用浏览器内 repository 与 localStorage。
export const dataSource = import.meta.env?.VITE_DATA_SOURCE ?? "api";
if (dataSource !== "api" && dataSource !== "mock") throw new Error(`VITE_DATA_SOURCE 只能是 api 或 mock，现在是 ${dataSource}`);
export const repository = dataSource === "api" ? createApiRepository() : mockRepository;
// endregion data-source
