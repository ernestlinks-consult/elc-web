import { birthForm } from "./birth";
import { examsForm } from "./exams";
import { passportForm } from "./passport";
import { schoolForm } from "./school";
import { travelForm } from "./travel";
import { serviceKeys, type ServiceForm, type ServiceKey } from "./types";
import { visaForm } from "./visa";
import { workForm } from "./work";

export const serviceForms: Record<ServiceKey, ServiceForm> = {
  passport: passportForm,
  birth: birthForm,
  school: schoolForm,
  visa: visaForm,
  work: workForm,
  exams: examsForm,
  travel: travelForm,
};

export const defaultService: ServiceKey = "passport";

export function isServiceKey(value: unknown): value is ServiceKey {
  return serviceKeys.includes(value as ServiceKey);
}

export { serviceKeys };
export type { ServiceForm, ServiceKey };
