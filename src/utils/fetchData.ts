import axios from "axios";

export interface IStatsRes {
  nodes: number;
  farms: number;
  countries: number;
  totalCru: number;
  totalSru: number;
  totalMru: number;
  totalHru: number;
  publicIps: number;
  accessNodes: number;
  gateways: number;
  twins: number;
  contracts: number;
  nodesDistribution: { [country: string]: number };
}

function merge(...objs: Object[]) {
  const keys = new Set(objs.map((obj) => Object.keys(obj)).flat());
  const [x, y, z] = objs;

  return Array.from(keys).reduce((res, key) => {
    res[key] = (x[key] || 0) + (y[key] || 0) + (z[key] || 0);
    return res;
  }, {} as { [key: string]: number });
}



function fetchStats(url: string) {
  return function _fetchStats(x = 0) {
    return axios.get<IStatsRes>(url)
    .then(({ data }) => data)
    .catch((error) => {
      if (x >= 2) console.log("The network might be down");
      else _fetchStats(x + 1);
    }) as Promise<IStatsRes>;
  }
}



export async function fetchData() {

  // console.log(await fetchStatsDev()) ;
  const dev = await fetchStats("https://gridproxy.dev.grid.tf/stats?status=up")();
  const test = await fetchStats("https://gridproxy.test.grid.tf/stats?status=up")();
  const main = await fetchStats("https://gridproxy.grid.tf/stats?status=up")();



  return {
    ...merge(dev || {}, test || {}, main || {}),
    nodesDistribution: merge(
      dev.nodesDistribution || {},
      test.nodesDistribution || {},
      main.nodesDistribution || {}
    ),
  } as IStatsRes;
}
