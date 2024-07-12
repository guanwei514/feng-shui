import React, { useState, useEffect } from "react";
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

interface DirectionInfo {
  hexagram: string;
  type: string;
  polarity: string;
}

interface BuildingDoorDirectionInfo {
  description: string;
}

const transformHexagramMap: { [key: string]: string } = {
  延年: "乾",
  天乙: "艮",
  生氣: "震",
  六煞: "坎",
  絕命: "兌",
  五鬼: "離",
  禍害: "坤",
};

const compatibilityMap: { [key: string]: [string, string][] } = {
  延年: [
    ["坎", "離"],
    ["震", "巽"],
    ["乾", "坤"],
    ["艮", "兌"],
  ],
  天乙: [
    ["坎", "震"],
    ["離", "巽"],
    ["乾", "艮"],
    ["坤", "兌"],
  ],
  生氣: [
    ["坎", "巽"],
    ["離", "震"],
    ["乾", "兌"],
    ["坤", "艮"],
  ],
  六煞: [
    ["坎", "乾"],
    ["離", "坤"],
    ["震", "艮"],
    ["巽", "兌"],
  ],
  絕命: [
    ["坎", "坤"],
    ["離", "乾"],
    ["震", "兌"],
    ["巽", "艮"],
  ],
  五鬼: [
    ["坎", "艮"],
    ["離", "兌"],
    ["震", "乾"],
    ["巽", "坤"],
  ],
  禍害: [
    ["坎", "兌"],
    ["震", "坤"],
    ["離", "艮"],
    ["巽", "乾"],
  ],
};

const buildingDoorDirectionMap: { [key: string]: BuildingDoorDirectionInfo } = {
  大門置中: { description: "以坐到向，寄卦編宅" },
  大門不置中: { description: "以門到向，寄卦編宅" },
};

const directionsMap: { [key: string]: DirectionInfo } = {
  北: { hexagram: "坎", type: "水", polarity: "" },
  東北: { hexagram: "艮", type: "土", polarity: "+" },
  東: { hexagram: "震", type: "木", polarity: "+" },
  東南: { hexagram: "巽", type: "木", polarity: "-" },
  南: { hexagram: "離", type: "火", polarity: "" },
  西南: { hexagram: "坤", type: "土", polarity: "-" },
  西: { hexagram: "兌", type: "金", polarity: "-" },
  西北: { hexagram: "乾", type: "金", polarity: "+" },
};
const buildingDoorDirections = Object.keys(buildingDoorDirectionMap);
const directions = Object.keys(directionsMap);
const floors = Array.from({ length: 30 }, (_, i) => i + 1);

const typeOrder = ["水", "木", "火", "土", "金"];
const hexagramByType: { [key: string]: { [key: string]: string } } = {
  水: { "": "坎" },
  木: { "+": "震", "-": "巽" },
  火: { "": "離" },
  土: { "+": "艮", "-": "坤" },
  金: { "+": "乾", "-": "兌" },
};

function getNextType(currentType: string): string {
  const currentIndex = typeOrder.indexOf(currentType);
  return typeOrder[(currentIndex + 1) % typeOrder.length];
}

function getHexagramInfo(hexagram: string): DirectionInfo | undefined {
  for (const [direction, info] of Object.entries(directionsMap)) {
    if (info.hexagram === hexagram) {
      return info;
    }
  }
  return undefined;
}

function calculateFloorHexagram(
  hexagram: string,
  floor: number
): DirectionInfo | undefined {
  let currentInfo = getHexagramInfo(hexagram);
  if (!currentInfo) {
    console.error("Invalid hexagram provided.");
    return undefined;
  }

  for (let i = 1; i < floor; i++) {
    const nextType = getNextType(currentInfo.type);
    let nextPolarity: string = currentInfo.polarity;
    if (nextPolarity === "") nextPolarity = "+";
    if (nextType === "水" || nextType === "火") nextPolarity = "";
    currentInfo = {
      type: nextType,
      polarity: nextPolarity,
      hexagram: hexagramByType[nextType][nextPolarity],
    };
  }
  return currentInfo;
}

function determineCompatibility(hexagram1: string, hexagram2: string): string {
  if (hexagram1 === hexagram2) {
    return "伏";
  }

  for (const [result, pairs] of Object.entries(compatibilityMap)) {
    for (const pair of pairs) {
      if (
        (pair[0] === hexagram1 && pair[1] === hexagram2) ||
        (pair[1] === hexagram1 && pair[0] === hexagram2)
      ) {
        return result;
      }
    }
  }
  return "不相容";
}

function determineTransformHexagram(
  hexagram1: string,
  hexagram2: string
): string {
  if (hexagram1 === hexagram2) {
    return "伏";
  }

  for (const [result, pairs] of Object.entries(compatibilityMap)) {
    for (const pair of pairs) {
      if (
        (pair[0] === hexagram1 && pair[1] === hexagram2) ||
        (pair[1] === hexagram1 && pair[0] === hexagram2)
      ) {
        return transformHexagramMap[result];
      }
    }
  }
  return "不相容";
}

const App: React.FC = () => {
  const [buildingDoorDirection, setBuildingDoorDirection] = useState("");
  const [buildingBaseDirection, setBuildingBaseDirection] = useState("");
  const [buildingDirection, setBuildingDirection] = useState("");
  const [transformHexagram, setTransformHexagram] = useState("");
  const [floor, setFloor] = useState("");
  const [unitDirection, setUnitDirection] = useState("");
  const [floorHexagram, setFloorHexagram] = useState<DirectionInfo | null>(
    null
  );
  const [compatibility, setCompatibility] = useState<string>("");

  useEffect(() => {
    if (buildingDirection && buildingBaseDirection) {
      const transformHexagramResult = determineTransformHexagram(
        directionsMap[buildingBaseDirection].hexagram,
        directionsMap[buildingDirection].hexagram
      );
      setTransformHexagram(transformHexagramResult);
    } else {
      setTransformHexagram("");
    }
  }, [buildingDirection, buildingBaseDirection]);

  useEffect(() => {
    if (transformHexagram && floor) {
      const calculatedHexagram = calculateFloorHexagram(
        transformHexagram,
        parseInt(floor)
      );
      setFloorHexagram(calculatedHexagram!);
    } else {
      setFloorHexagram(null);
    }
  }, [transformHexagram, floor]);

  useEffect(() => {
    if (floorHexagram && unitDirection) {
      const unitHexagram = directionsMap[unitDirection].hexagram;
      const result = determineCompatibility(
        floorHexagram.hexagram,
        unitHexagram
      );
      setCompatibility(result);
    } else {
      setCompatibility("");
    }
  }, [floorHexagram, unitDirection]);
  const handleBuildingDoorDirectionChange = (event: SelectChangeEvent) => {
    setBuildingDoorDirection(event.target.value as string);
    setBuildingBaseDirection("");
  };
  const handleBuildingBaseDirectionChange = (event: SelectChangeEvent) => {
    setBuildingBaseDirection(event.target.value as string);
    setFloorHexagram(null);
    setCompatibility("");
  };
  const handleBuildingDirectionChange = (event: SelectChangeEvent) => {
    setBuildingDirection(event.target.value as string);
    setFloorHexagram(null);
    setCompatibility("");
  };

  const handleFloorChange = (event: SelectChangeEvent) => {
    setFloor(event.target.value as string);
    setFloorHexagram(null);
    setCompatibility("");
  };

  const handleUnitDirectionChange = (event: SelectChangeEvent) => {
    setUnitDirection(event.target.value as string);
    setCompatibility("");
  };

  const renderBuildingDoorDirectionInfo = (
    direction: string,
    info: BuildingDoorDirectionInfo | null
  ) => {
    if (!direction || !info) return null;
    return (
      <Typography variant="body2">
        {direction} - {info.description}
      </Typography>
    );
  };

  const renderDirectionInfo = (
    direction: string,
    info: DirectionInfo | null
  ) => {
    if (!direction || !info) return null;
    return (
      <Typography variant="body2">
        {direction} - {info.hexagram} (類型: {info.type}, 極性:{" "}
        {info.polarity || "無"})
      </Typography>
    );
  };

  const renderTransformHexagramInfo = (
    baseDirection: string,
    direction: string
  ) => {
    if (!buildingDoorDirection || (!baseDirection && !direction)) return;
    if (!baseDirection) {
      return (
        <Typography variant="body2">
          {`尚未決定${
            buildingDoorDirection === "大門置中" ? "住宅坐方位" : "住宅大門方位"
          }，無法計算寄卦。`}
        </Typography>
      );
    }
    if (!direction) {
      return (
        <Typography variant="body2">
          {`尚未決定住宅朝向，無法計算寄卦。`}
        </Typography>
      );
    }
    const directionInfo = getHexagramInfo(transformHexagram);
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {`寄卦編宅結果: ${transformHexagram} (${directionInfo?.type}${directionInfo?.polarity})`}
        </Typography>
      </Box>
    );
  };

  const getCompatibilityDescription = (compatibility: string): string => {
    switch (compatibility) {
      case "延年":
        return "延年門 ( 武曲星 ) : 人丁旺，出聰明人才，出長壽人，發田莊。";
      case "天乙":
        return "天醫門 ( 巨門星 ) : 加官進爵，生財旺相，子孫聰明剛健 。";
      case "生氣":
        return "生氣門 ( 貪狼星 ) : 人丁旺，出生意人才，住家平安，富貴長久。";
      case "六煞":
        return "六煞門 ( 文曲星 ) : 初年丁財旺先吉後凶家破人亡，邪淫，災難多破財。";
      case "絕命":
        return "絕命門 ( 破軍星 ) : 不生子女多後絕，官災意外多。";
      case "五鬼":
        return "五鬼門 ( 廉貞星 ) : 貧窮，災害，疾病，鬼魅，口舌，血光意外。";
      case "禍害":
        return "禍害門 ( 祿存星 ) : 人不旺財也不旺，事事不順，子女依賴重，小不順，後絕，不生子。";
      case "伏":
        return "伏位門 ( 輔弼星 ) : 無定位遇吉則吉遇凶則凶，小康之家三代後絕。";
      default:
        return "這個組合沒有特定的風水意義。";
    }
  };
  const getCompatibilityColor = (compatibility: string): string => {
    if (["延年", "天乙", "生氣"].includes(compatibility)) {
      return "green"; // 綠色
    } else if (["六煞", "絕命", "五鬼", "禍害"].includes(compatibility)) {
      return "red"; // 紅色
    }
    return "inherit"; // 默認顏色
  };
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          此工具僅為個人使用，勿將其用於商業行為。
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>住宅大門置向</InputLabel>
          <Select
            value={buildingDoorDirection}
            label="住宅大門置向"
            onChange={handleBuildingDoorDirectionChange}
          >
            {buildingDoorDirections.map((direction) => (
              <MenuItem key={direction} value={direction}>
                {`${direction}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {renderBuildingDoorDirectionInfo(
          buildingDoorDirection,
          buildingDoorDirectionMap[buildingDoorDirection]
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel>
            {buildingDoorDirection === "大門置中"
              ? "住宅坐方位"
              : "住宅大門方位"}
          </InputLabel>
          <Select
            value={buildingBaseDirection}
            label={
              buildingDoorDirection === "大門置中"
                ? "住宅坐方位"
                : "住宅大門方位"
            }
            onChange={handleBuildingBaseDirectionChange}
          >
            <MenuItem value="" key="empty">
              None
            </MenuItem>
            {directions.map((direction) => (
              <MenuItem
                key={direction}
                value={direction}
                disabled={direction === buildingDirection}
              >
                {direction}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {renderDirectionInfo(
          buildingBaseDirection,
          directionsMap[buildingBaseDirection]
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel>住宅朝向</InputLabel>
          <Select
            value={buildingDirection}
            label="住宅朝向"
            onChange={handleBuildingDirectionChange}
          >
            <MenuItem value="" key="empty">
              None
            </MenuItem>
            {directions.map((direction) => (
              <MenuItem
                key={direction}
                value={direction}
                disabled={direction === buildingBaseDirection}
              >
                {direction}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {renderDirectionInfo(
          buildingDirection,
          directionsMap[buildingDirection]
        )}
        {renderTransformHexagramInfo(buildingBaseDirection, buildingDirection)}
        <FormControl fullWidth margin="normal">
          <InputLabel>住戶樓層</InputLabel>
          <Select value={floor} label="住戶樓層" onChange={handleFloorChange}>
            {floors.map((floor) => (
              <MenuItem key={floor} value={floor}>
                {floor}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {floorHexagram && (
          <Typography variant="body2">
            {floor}樓 - {floorHexagram.hexagram} (類型: {floorHexagram.type},
            極性: {floorHexagram.polarity || "無"})
          </Typography>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel>住戶大門方位</InputLabel>
          <Select
            value={unitDirection}
            label="住戶大門方位"
            onChange={handleUnitDirectionChange}
          >
            {directions.map((direction) => (
              <MenuItem key={direction} value={direction}>
                {direction}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {renderDirectionInfo(unitDirection, directionsMap[unitDirection])}

        {compatibility && (
          <>
            <Typography
              variant="body1"
              sx={{ mt: 2 }}
              color={getCompatibilityColor(compatibility)}
            >
              相容性: {compatibility}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1 }}
              color={getCompatibilityColor(compatibility)}
            >
              {getCompatibilityDescription(compatibility)}
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default App;
