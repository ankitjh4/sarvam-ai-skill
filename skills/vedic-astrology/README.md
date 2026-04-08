# 🪐 Vedic Astrology Skill

> Complete Vedic astrology chart generation and interpretation using Krishnamurthi Paddhati (KP) system, classical Parashara principles, and traditional texts.

## Quick Start

### Generate a Birth Chart

```bash
bun scripts/generate-chart.ts \
  --date "1990-07-15" \
  --time "14:30:00" \
  --lat 28.6139 \
  --lon 77.2090 \
  --tz 5.5 \
  --name "Sample Person" \
  --place "New Delhi"
```

**Output**: Complete JSON file with D1-D60 charts, Panchanga, Dashas, Shadbala, Ashtakavarga, and KP significators

### Get Today's Panchanga

```bash
bun scripts/panchanga.ts \
  --lat 28.6139 \
  --lon 77.2090 \
  --tz 5.5 \
  --place "Delhi"
```

**Output**: Tithi, Nakshatra, Yoga, Karana, Vaara with sunrise/sunset timings

## Feature Status

| Feature | Status | Script |
|---------|--------|--------|
| Birth Chart Generation | ✅ Implemented | `scripts/generate-chart.ts` |
| Chart Interpretation | ✅ Implemented | `scripts/interpret-chart.ts` |
| Panchanga (Almanac) | ✅ Implemented | `scripts/panchanga.ts` |
| Quick Format | ✅ Implemented | `scripts/quick-format.py` |
| Dasha Analysis | ✅ Implemented | `scripts/analyze-dasha.ts` |
| Transit Analysis | ✅ Implemented | `scripts/transit.ts` |
| Horary Charts | ✅ Implemented | `scripts/generate-horary.ts` |
| Compatibility | ✅ Implemented | `scripts/compatibility.ts` |

## What's Included

### Chart Components
- **D1-D60 Divisional Charts**: Complete varga chakra following Vedic principles
- **Panchanga**: Five limbs - Tithi, Nakshatra, Yoga, Karana, Vaara
- **Vimshottari Dasha**: 120-year planetary period system with Mahadasha/Antardasha
- **Shadbala**: Six-fold planetary strength (Sthanabala, Kaalabala, Digbala, etc.)
- **Ashtakavarga**: Point-based strength system (SAV and BAV)
- **Planetary Aspects**: Traditional Vedic aspects (7th, Mars 4/8, Jupiter 5/9, Saturn 3/10)

### Astrological Systems
- **Krishnamurthi Paddhati (KP)**: 249 subdivisions, sublord system, ABCD significators
- **Parashara System**: Classical Vedic astrology from Brihat Parashara Hora Shastra
- **Traditional Yogas**: Raj Yoga, Dhana Yoga, Mahapurusha Yogas, etc.

### Libraries Used
1. **jyotishganit**: Professional grade with NASA JPL DE421 ephemeris
2. **VedicAstro**: KP system specialization with sublords and significators
3. **flatlib**: Traditional astrology with Swiss Ephemeris

## Key Features

### Precision
- NASA JPL DE421 ephemeris data (arc-second accuracy)
- True Chitra Paksha (Lahiri) ayanamsa
- Sidereal zodiac with whole sign houses

### Comprehensive Interpretation
- All 12 houses with detailed significations
- 9 planets (grahas) with dignities and strengths
- 27 nakshatras with pada divisions
- Planetary yogas and combinations
- KP judgment rules for timing

### Traditional Texts Referenced
- Brihat Parashara Hora Shastra
- Brihat Jataka (Varahamihira)
- Saravali (Kalyana Varma)
- Phaladeepika (Mantreswara)
- KP Readers (K.S. Krishnamurti)
- Fundamentals of Hindu Astrology (S. Kannan)

## Use Cases

### Personal Consultations
```bash
# Generate natal chart
generate-chart.ts --date "1985-03-20" --time "08:15:00" --lat 19.0760 --lon 72.8777 --tz 5.5 --name "Client"

# Get career insights
interpret-chart.ts --chart "Charts/client.json" --focus "career"

# Check marriage timing
interpret-chart.ts --chart "Charts/client.json" --focus "marriage"
```

### Horary Astrology (Prasna)
```bash
# Question-based chart
generate-horary.ts --question "Will I get the job?" --lat 12.9716 --lon 77.5946 --tz 5.5
```

### Daily Almanac
```bash
# Today's panchanga
panchanga.ts --lat 28.6139 --lon 77.2090 --tz 5.5

# Month view
panchanga.ts --start-date "2024-04-01" --end-date "2024-04-30" --lat 13.0827 --lon 80.2707 --tz 5.5
```

### Compatibility Analysis
```bash
# Match two charts
compatibility.ts --chart1 "Charts/person1.json" --chart2 "Charts/person2.json"
```

## Major Indian Cities Coordinates

| City | Latitude | Longitude | TZ |
|------|----------|-----------|-----|
| Mumbai | 19.0760 | 72.8777 | 5.5 |
| Delhi | 28.6139 | 77.2090 | 5.5 |
| Bangalore | 12.9716 | 77.5946 | 5.5 |
| Chennai | 13.0827 | 80.2707 | 5.5 |
| Kolkata | 22.5726 | 88.3639 | 5.5 |
| Hyderabad | 17.3850 | 78.4867 | 5.5 |
| Pune | 18.5204 | 73.8567 | 5.5 |
| Ahmedabad | 23.0225 | 72.5714 | 5.5 |
| Jaipur | 26.9124 | 75.7873 | 5.5 |
| Lucknow | 26.8467 | 80.9462 | 5.5 |

## Understanding the Output

### Divisional Charts (Vargas)
- **D1 (Rasi)**: Overall life, personality, general trends
- **D9 (Navamsa)**: Marriage, spouse characteristics, spiritual path (most important divisional chart)
- **D10 (Dasamsa)**: Career, profession, achievements, public life
- **D7 (Saptamsa)**: Children, progeny, creative output
- **D2 (Hora)**: Wealth accumulation, financial prosperity
- **D60 (Shashtiamsa)**: Past life karma, final confirmation of predictions

### Panchanga Elements
- **Tithi**: Lunar day (1-30, waxing/waning)
- **Nakshatra**: Moon's constellation (1 of 27, shows mental nature)
- **Yoga**: Sun-Moon combination (auspiciousness indicator)
- **Karana**: Half-tithi (activity suitability)
- **Vaara**: Weekday (ruling planet influence)

### Vimshottari Dasha Periods
- **Mahadasha**: Major period (6-20 years depending on planet)
- **Antardasha**: Sub-period within Mahadasha
- **Pratyantardasha**: Sub-sub-period (for fine timing)

### Shadbala Components
Minimum required strength in Rupas:
- Sun: 5, Moon: 6, Mars: 5, Mercury: 7, Jupiter: 6.5, Venus: 5.5, Saturn: 5

Below minimum = planet cannot give full results

### KP Significators (ABCD)
- **A**: Planets in constellation of house occupant (strongest)
- **B**: Planets in the house (strong)
- **C**: Planets in constellation of house lord (moderate)
- **D**: House lord itself (weakest)

## Installation

Dependencies are auto-installed on first run:
```bash
pip3 install jyotishganit vedicastro
pip3 install git+https://github.com/diliprk/flatlib.git@sidereal#egg=flatlib
```

## Documentation

- **Full Skill Documentation**: `SKILL.md`
- **Comprehensive References**: `references/README.md`
- **House Significations**: Complete list in references
- **Planetary Characteristics**: All 9 grahas detailed
- **Nakshatra Guide**: All 27 with deities and qualities
- **Yoga Definitions**: Major combinations explained
- **KP Rules**: Timing and judgment techniques
- **Remedial Measures**: Gemstones, mantras, charity

## Ethical Use

When interpreting charts:
1. Emphasize free will over fatalism
2. Provide remedies alongside challenges
3. Be compassionate in communication
4. Respect privacy of birth data
5. Suggest professional consultation for complex cases

## Learning Resources

**Books**:
- "Light on Life" by Hart de Fouw
- "Brihat Parashara Hora Shastra" by R. Santhanam
- "KP Reader" series by K.S. Krishnamurti
- "Fundamentals of Hindu Astrology" by S. Kannan

**Online**:
- Saptarishis Astrology (saptarishisastrology.com)
- Vedic Astrology Research (vedic-astrology.net)
- KP Astrology Forum (kpastroforum.com)

## Support

For questions or issues with this skill:
1. Check `SKILL.md` for detailed usage
2. Review `references/README.md` for interpretation guidance
3. Verify birth time accuracy (±5 minutes can change ascendant)
4. Ensure correct timezone offset (IST = UTC+5.5)

## Contributing

Enhancements welcome:
- Additional interpretation rules from classical texts
- More yoga calculations
- Regional system variations (Tamil, Kerala)
- Enhanced remedy suggestions
- PDF report generation

## License

MIT License - See repository LICENSE file

---

**॥ श्री गणेशाय नमः ॥**  
*Built with reverence for the ancient science of Jyotish*
