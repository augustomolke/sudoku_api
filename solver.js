const glpk = require("glpk.js");
const buildModel = async (glpk, initial, max) => {
  let subGroupSize = parseInt(max) ** 0.5;
  //Cria arrais de variaveis, restrições e bounds
  let vars = [];
  let restLinhas = [];
  let restColunas = [];
  let restSubGroups = [];
  let restPerPosition = [];
  let restInicial = [];
  let bounds = [];
  let subGroups = [];

  var matrix = [];
  let nums = parseInt(max) + 1;
  let linhas = nums - 1;
  let colunas = nums - 1;

  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      for (let num = 1; num < nums; num++) {
        vars.push({ name: `x_${num}_${i}_${j}`, num: num, i: i, j: j });
        bounds.push(`x_${num}_${i}_${j}`);
      }
    }
  }

  //cria restricao de solucao inicial

  for (val in initial) {
    let restr = {
      name: `init_${initial[val].val}_${initial[val].i}_${initial[val].j}`,
      vars: [
        {
          name: `x_${initial[val].val}_${initial[val].i}_${initial[val].j}`,
          coef: 1.0,
        },
      ],
      bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
    };
    restInicial.push(restr);
  }

  //cria restrição de posicao
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      let restr = {
        name: `posicao_${i}_${j}`,
        vars: [],
        bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
      };
      for (let num = 1; num < nums; num++) {
        restr.vars.push({ name: `x_${num}_${i}_${j}`, coef: 1.0 });
      }
      restPerPosition.push(restr);
    }
  }

  //cria restrição de linha
  for (let num = 1; num < nums; num++) {
    for (let i = 0; i < linhas; i++) {
      let restr = {
        name: `linha_${num}_${i}`,
        vars: [],
        bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
      };
      for (let j = 0; j < colunas; j++) {
        restr.vars.push({ name: `x_${num}_${i}_${j}`, coef: 1.0 });
      }
      restLinhas.push(restr);
    }
  }

  //cria restrição de coluna
  for (let num = 1; num < nums; num++) {
    for (let j = 0; j < colunas; j++) {
      let restr = {
        name: `coluna_${num}_${j}`,
        vars: [],
        bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
      };
      for (let i = 0; i < linhas; i++) {
        restr.vars.push({ name: `x_${num}_${i}_${j}`, coef: 1.0 });
      }
      restColunas.push(restr);
    }
  }

  //cria restrição de sub grupo
  if (colunas % subGroupSize == 0 && linhas % subGroupSize == 0) {
    for (let i = 0; i < subGroupSize; i++) {
      for (let j = 0; j < subGroupSize; j++) {
        subGroups.push({
          name: `sub_${i}_${j}`,
          max_i: (i + 1) * subGroupSize - 1,
          max_j: (j + 1) * subGroupSize - 1,
          min_i: (i + 1) * subGroupSize - subGroupSize,
          min_j: (j + 1) * subGroupSize - subGroupSize,
        });
      }
    }
  }

  for (s of subGroups) {
    for (let num = 1; num < nums; num++) {
      let rest = {
        name: `${s.name}_${num}`,
        vars: [],
        bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
      };

      for (let i = s.min_i; i <= s.max_i; i++) {
        for (let j = s.min_j; j <= s.max_j; j++) {
          rest.vars.push({ name: `x_${num}_${i}_${j}`, coef: 1.0 });
        }
      }
      restSubGroups.push(rest);
    }
  }
  //cria o modelo
  let lp = {
    name: "LP",
    objective: {
      direction: glpk.GLP_MAX,
      name: "obj",
      vars: [{ name: "x_1_0_0", coef: 0 }],
    },
    subjectTo: restLinhas.concat(
      restColunas,
      restSubGroups,
      restPerPosition,
      restInicial
    ),
    binaries: bounds,
  };

  const sol = glpk.solve(lp, glpk.GLP_MSG_ALL);
  const output = sol.result;

  if (output.status == 4) {
    return "UNFEASIBLE";
  }

  const solution = output.vars;

  for (let i = 0; i < linhas; i++) {
    matrix.push([]);
    for (let j = 0; j < colunas; j++) {
      matrix[i].push(0);
    }
  }

  for (x in solution) {
    if (solution[x] == 1) {
      let arr = x.split("_");
      matrix[parseInt(arr[2])][parseInt(arr[3])] = parseInt(arr[1]);
    }
  }
  return matrix;
};

const solver = async (initial, max) => {
  let result = await glpk;
  return buildModel(result, initial, max);
};

module.exports = solver;
